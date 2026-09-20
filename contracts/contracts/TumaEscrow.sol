// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TumaEscrow
/// @notice Holds USDC payments that are claimable by the owner of an X (Twitter) handle.
///         A trusted operator (the Tuma server) releases funds after it verifies the handle.
contract TumaEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        Open,
        Claimed,
        Refunded
    }

    struct Payment {
        address sender;
        uint256 amount;
        string handle;
        uint64 expiry;
        Status status;
    }

    uint64 public constant CLAIM_PERIOD = 30 days;

    IERC20 public immutable usdc;
    address public operator;

    uint256 public nextId = 1;
    mapping(uint256 => Payment) public payments;

    event Deposited(
        uint256 indexed id,
        address indexed sender,
        string handle,
        uint256 amount,
        uint64 expiry
    );
    event Released(uint256 indexed id, address to);
    event Refunded(uint256 indexed id);
    event OperatorChanged(address indexed previousOperator, address indexed newOperator);

    error InvalidHandle();
    error InvalidAmount();
    error NotOpen();
    error NotExpired();
    error NotSender();
    error NotOperator();
    error ZeroAddress();

    modifier onlyOperator() {
        if (msg.sender != operator) revert NotOperator();
        _;
    }

    constructor(address usdc_, address operator_) Ownable(msg.sender) {
        if (usdc_ == address(0) || operator_ == address(0)) revert ZeroAddress();
        usdc = IERC20(usdc_);
        operator = operator_;
    }

    /// @notice Update the server operator wallet. Owner only.
    function setOperator(address newOperator) external onlyOwner {
        if (newOperator == address(0)) revert ZeroAddress();
        address previous = operator;
        operator = newOperator;
        emit OperatorChanged(previous, newOperator);
    }

    /// @notice Deposit USDC to be claimed by the owner of `handle`.
    /// @dev Caller must approve this contract for `amount` first.
    function deposit(string calldata handle, uint256 amount) external nonReentrant returns (uint256 id) {
        if (!isValidHandle(handle)) revert InvalidHandle();
        if (amount == 0) revert InvalidAmount();

        id = nextId++;
        uint64 expiry = uint64(block.timestamp) + CLAIM_PERIOD;

        payments[id] = Payment({
            sender: msg.sender,
            amount: amount,
            handle: handle,
            expiry: expiry,
            status: Status.Open
        });

        emit Deposited(id, msg.sender, handle, amount, expiry);

        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Release an open payment to `to`. Operator only.
    function release(uint256 id, address to) external onlyOperator nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        Payment storage payment = payments[id];
        if (payment.status != Status.Open) revert NotOpen();

        payment.status = Status.Claimed;
        emit Released(id, to);

        usdc.safeTransfer(to, payment.amount);
    }

    /// @notice Refund the original sender after the claim period has passed.
    function refund(uint256 id) external nonReentrant {
        Payment storage payment = payments[id];
        if (payment.status != Status.Open) revert NotOpen();
        if (msg.sender != payment.sender) revert NotSender();
        if (block.timestamp < payment.expiry) revert NotExpired();

        payment.status = Status.Refunded;
        emit Refunded(id);

        usdc.safeTransfer(payment.sender, payment.amount);
    }

    /// @notice A handle is 1-15 chars of lowercase a-z, 0-9 or underscore (no "@").
    function isValidHandle(string calldata handle) public pure returns (bool) {
        bytes calldata b = bytes(handle);
        if (b.length == 0 || b.length > 15) return false;
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            bool ok = (c >= 0x61 && c <= 0x7A) || // a-z
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c == 0x5F); // _
            if (!ok) return false;
        }
        return true;
    }
}
