import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { TumaEscrow, MockUSDC } from "../typechain-types";

const AMOUNT = ethers.parseUnits("25", 6);
const THIRTY_DAYS = 30 * 24 * 60 * 60;

describe("TumaEscrow", () => {
  let escrow: TumaEscrow;
  let usdc: MockUSDC;
  let owner: any;
  let operator: any;
  let sender: any;
  let recipient: any;
  let other: any;

  beforeEach(async () => {
    [owner, operator, sender, recipient, other] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockUSDC");
    usdc = await Mock.deploy();
    await usdc.waitForDeployment();

    const Escrow = await ethers.getContractFactory("TumaEscrow");
    escrow = await Escrow.deploy(await usdc.getAddress(), operator.address);
    await escrow.waitForDeployment();

    await usdc.mint(sender.address, ethers.parseUnits("1000", 6));
    await usdc.connect(sender).approve(await escrow.getAddress(), ethers.MaxUint256);
  });

  async function deposit(handle = "alice", amount = AMOUNT): Promise<bigint> {
    const id = await escrow.connect(sender).deposit.staticCall(handle, amount);
    await escrow.connect(sender).deposit(handle, amount);
    return id;
  }

  describe("deposit", () => {
    it("pulls USDC, stores the payment and emits Deposited", async () => {
      const before = await usdc.balanceOf(sender.address);
      const id = await escrow.connect(sender).deposit.staticCall("alice", AMOUNT);

      await expect(escrow.connect(sender).deposit("alice", AMOUNT))
        .to.emit(escrow, "Deposited")
        .withArgs(id, sender.address, "alice", AMOUNT, (v: bigint) => v > 0);

      expect(await usdc.balanceOf(sender.address)).to.equal(before - AMOUNT);
      expect(await usdc.balanceOf(await escrow.getAddress())).to.equal(AMOUNT);

      const p = await escrow.payments(id);
      expect(p.sender).to.equal(sender.address);
      expect(p.amount).to.equal(AMOUNT);
      expect(p.handle).to.equal("alice");
      expect(p.status).to.equal(0); // Open
      expect(p.expiry).to.be.greaterThan(await time.latest());
    });

    it("rejects uppercase, too long, empty and '@' handles", async () => {
      for (const bad of ["Alice", "a".repeat(16), "", "al@ce", "with space"]) {
        await expect(escrow.connect(sender).deposit(bad, AMOUNT)).to.be.revertedWithCustomError(
          escrow,
          "InvalidHandle"
        );
      }
    });

    it("accepts a 15-char handle and underscores/digits", async () => {
      await expect(escrow.connect(sender).deposit("a_b123456789012", AMOUNT)).to.not.be.reverted;
      await expect(escrow.connect(sender).deposit("abc_123", AMOUNT)).to.not.be.reverted;
    });

    it("rejects a zero amount", async () => {
      await expect(escrow.connect(sender).deposit("alice", 0)).to.be.revertedWithCustomError(
        escrow,
        "InvalidAmount"
      );
    });
  });

  describe("release", () => {
    it("lets the operator release to the recipient", async () => {
      const id = await deposit();
      await expect(escrow.connect(operator).release(id, recipient.address))
        .to.emit(escrow, "Released")
        .withArgs(id, recipient.address);

      expect(await usdc.balanceOf(recipient.address)).to.equal(AMOUNT);
      expect((await escrow.payments(id)).status).to.equal(1); // Claimed
    });

    it("reverts when called by a non-operator", async () => {
      const id = await deposit();
      await expect(escrow.connect(other).release(id, recipient.address)).to.be.revertedWithCustomError(
        escrow,
        "NotOperator"
      );
    });

    it("cannot release the same payment twice", async () => {
      const id = await deposit();
      await escrow.connect(operator).release(id, recipient.address);
      await expect(escrow.connect(operator).release(id, recipient.address)).to.be.revertedWithCustomError(
        escrow,
        "NotOpen"
      );
    });

    it("reverts when releasing to the zero address", async () => {
      const id = await deposit();
      await expect(
        escrow.connect(operator).release(id, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("cannot release after a refund", async () => {
      const id = await deposit();
      await time.increase(THIRTY_DAYS + 1);
      await escrow.connect(sender).refund(id);
      await expect(escrow.connect(operator).release(id, recipient.address)).to.be.revertedWithCustomError(
        escrow,
        "NotOpen"
      );
    });
  });

  describe("refund", () => {
    it("reverts before the expiry", async () => {
      const id = await deposit();
      await expect(escrow.connect(sender).refund(id)).to.be.revertedWithCustomError(escrow, "NotExpired");
    });

    it("returns the USDC to the sender after expiry", async () => {
      const id = await deposit();
      const before = await usdc.balanceOf(sender.address);
      await time.increase(THIRTY_DAYS + 1);

      await expect(escrow.connect(sender).refund(id)).to.emit(escrow, "Refunded").withArgs(id);

      expect(await usdc.balanceOf(sender.address)).to.equal(before + AMOUNT);
      expect((await escrow.payments(id)).status).to.equal(2); // Refunded
    });

    it("reverts when a non-sender tries to refund", async () => {
      const id = await deposit();
      await time.increase(THIRTY_DAYS + 1);
      await expect(escrow.connect(other).refund(id)).to.be.revertedWithCustomError(escrow, "NotSender");
    });

    it("cannot refund twice", async () => {
      const id = await deposit();
      await time.increase(THIRTY_DAYS + 1);
      await escrow.connect(sender).refund(id);
      await expect(escrow.connect(sender).refund(id)).to.be.revertedWithCustomError(escrow, "NotOpen");
    });
  });

  describe("operator", () => {
    it("can be changed by the owner", async () => {
      await expect(escrow.connect(owner).setOperator(recipient.address))
        .to.emit(escrow, "OperatorChanged")
        .withArgs(operator.address, recipient.address);

      const id = await deposit();
      await expect(escrow.connect(operator).release(id, recipient.address)).to.be.revertedWithCustomError(
        escrow,
        "NotOperator"
      );
      await expect(escrow.connect(recipient).release(id, recipient.address)).to.not.be.reverted;
    });

    it("cannot be changed by a non-owner", async () => {
      await expect(escrow.connect(other).setOperator(other.address)).to.be.revertedWithCustomError(
        escrow,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
