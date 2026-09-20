import { ethers } from "hardhat";

const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const operator = process.env.OPERATOR_ADDRESS;
  if (!operator) {
    throw new Error("OPERATOR_ADDRESS is not set in contracts/.env");
  }

  const usdc = process.env.USDC_ADDRESS ?? ARC_USDC_ADDRESS;
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Network   :", network.name, `(chainId ${network.chainId})`);
  console.log("Deployer  :", deployer.address);
  console.log("USDC      :", usdc);
  console.log("Operator  :", operator);

  const Escrow = await ethers.getContractFactory("TumaEscrow");
  const escrow = await Escrow.deploy(usdc, operator);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  const deployTx = escrow.deploymentTransaction();
  const receipt = deployTx ? await deployTx.wait() : null;
  const deployBlock = receipt?.blockNumber ?? 0;

  console.log("");
  console.log("TumaEscrow deployed");
  console.log("  address    :", address);
  console.log("  deployBlock:", deployBlock);
  console.log("");
  console.log("Add these to your root .env.local:");
  console.log(`  NEXT_PUBLIC_ESCROW_ADDRESS=${address}`);
  console.log(`  NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK=${deployBlock}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
