/// Contract ABIs for TumaEscrow and the Arc USDC ERC-20 interface.
/// Hand-written and kept in sync with contracts/contracts/TumaEscrow.sol.

export const TumaEscrowABI = [
  // ---- reads ----
  {
    type: "function",
    name: "nextId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "operator",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "usdc",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "CLAIM_PERIOD",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }],
  },
  {
    type: "function",
    name: "isValidHandle",
    stateMutability: "pure",
    inputs: [{ type: "string", name: "handle" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "payments",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "" }],
    outputs: [
      { type: "address", name: "sender" },
      { type: "uint256", name: "amount" },
      { type: "string", name: "handle" },
      { type: "uint64", name: "expiry" },
      { type: "uint8", name: "status" },
    ],
  },
  // ---- writes ----
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "handle" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "uint256", name: "id" }],
  },
  {
    type: "function",
    name: "release",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "id" },
      { type: "address", name: "to" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "id" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setOperator",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "newOperator" }],
    outputs: [],
  },
  // ---- events ----
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { type: "uint256", name: "id", indexed: true },
      { type: "address", name: "sender", indexed: true },
      { type: "string", name: "handle", indexed: false },
      { type: "uint256", name: "amount", indexed: false },
      { type: "uint64", name: "expiry", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Released",
    inputs: [
      { type: "uint256", name: "id", indexed: true },
      { type: "address", name: "to", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Refunded",
    inputs: [{ type: "uint256", name: "id", indexed: true }],
  },
  {
    type: "event",
    name: "OperatorChanged",
    inputs: [
      { type: "address", name: "previousOperator", indexed: true },
      { type: "address", name: "newOperator", indexed: true },
    ],
  },
  // ---- errors ----
  { type: "error", name: "InvalidHandle", inputs: [] },
  { type: "error", name: "InvalidAmount", inputs: [] },
  { type: "error", name: "NotOpen", inputs: [] },
  { type: "error", name: "NotExpired", inputs: [] },
  { type: "error", name: "NotSender", inputs: [] },
  { type: "error", name: "NotOperator", inputs: [] },
  { type: "error", name: "ZeroAddress", inputs: [] },
] as const;

/// Minimal ERC-20 ABI (the Arc USDC interface uses 6 decimals).
export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
] as const;

/// Mirrors the Status enum in TumaEscrow.sol.
export const PaymentStatus = {
  Open: 0,
  Claimed: 1,
  Refunded: 2,
} as const;

export type PaymentStatusValue = (typeof PaymentStatus)[keyof typeof PaymentStatus];
