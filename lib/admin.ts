import { TumaEscrowABI, erc20Abi } from "./abi";
import { ESCROW_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arc } from "./arc";
import { arcPublicClient, type PaymentView } from "./chain";
import { formatUnits } from "./format";

export type ProtocolOverview = {
  chainId: number;
  chainName: string;
  escrow: `0x${string}`;
  usdc: `0x${string}`;
  owner: `0x${string}`;
  operator: `0x${string}`;
  escrowBalance: string;
  operatorBalance: string;
  totalPayments: number;
  totalVolume: string;
  open: number;
  claimed: number;
  refunded: number;
  expired: number;
};

export type AdminData = {
  overview: ProtocolOverview;
  payments: PaymentView[];
};

const ZERO = "0x0000000000000000000000000000000000000000";
/// Cap how many payments the admin dashboard loads in one pass.
const MAX_PAYMENTS = 500;

function toPayment(
  id: string,
  tuple: readonly [`0x${string}`, bigint, string, bigint, number],
  now: number,
): PaymentView | null {
  const [sender, amount, handle, expiry, status] = tuple;
  if (sender === ZERO) return null;
  const expirySeconds = Number(expiry);
  return {
    id,
    sender,
    amount: formatUnits(amount, USDC_DECIMALS),
    amountRaw: amount.toString(),
    handle,
    expiry: expirySeconds,
    expiryLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(expirySeconds * 1000),
    ),
    expired: status === 0 && now > expirySeconds,
    status: Number(status),
  };
}

export async function getAllPayments(): Promise<PaymentView[]> {
  const nextId = await arcPublicClient.readContract({
    address: ESCROW_ADDRESS,
    abi: TumaEscrowABI,
    functionName: "nextId",
  });

  const total = Number(nextId) - 1;
  if (total <= 0) return [];

  const start = Math.max(1, total - MAX_PAYMENTS + 1);
  const ids: bigint[] = [];
  for (let i = start; i <= total; i++) ids.push(BigInt(i));

  const results = await arcPublicClient.multicall({
    contracts: ids.map((id) => ({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      functionName: "payments",
      args: [id],
    })),
    allowFailure: true,
  });

  const now = Math.floor(Date.now() / 1000);
  const payments: PaymentView[] = [];
  results.forEach((result, index) => {
    if (result.status !== "success") return;
    const payment = toPayment(
      ids[index].toString(),
      result.result as unknown as readonly [`0x${string}`, bigint, string, bigint, number],
      now,
    );
    if (payment) payments.push(payment);
  });

  return payments.sort((a, b) => Number(BigInt(b.id) - BigInt(a.id)));
}

export async function getAdminData(): Promise<AdminData> {
  const [nextId, owner, operator, escrowBalance, payments] = await Promise.all([
    arcPublicClient.readContract({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      functionName: "nextId",
    }),
    arcPublicClient.readContract({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      functionName: "owner",
    }),
    arcPublicClient.readContract({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      functionName: "operator",
    }),
    arcPublicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ESCROW_ADDRESS],
    }),
    getAllPayments(),
  ]);

  const operatorBalance = await arcPublicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [operator],
  });

  const volume = payments.reduce((sum, payment) => sum + BigInt(payment.amountRaw), 0n);
  const count = (status: number) => payments.filter((p) => p.status === status).length;

  return {
    overview: {
      chainId: arc.id,
      chainName: arc.name,
      escrow: ESCROW_ADDRESS,
      usdc: USDC_ADDRESS,
      owner,
      operator,
      escrowBalance: formatUnits(escrowBalance, USDC_DECIMALS),
      operatorBalance: formatUnits(operatorBalance, USDC_DECIMALS),
      totalPayments: Number(nextId) - 1,
      totalVolume: formatUnits(volume, USDC_DECIMALS),
      open: count(0) - payments.filter((p) => p.status === 0 && p.expired).length,
      claimed: count(1),
      refunded: count(2),
      expired: payments.filter((p) => p.status === 0 && p.expired).length,
    },
    payments,
  };
}
