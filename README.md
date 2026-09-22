# Tuma

**Send USDC to an [@handle](https://x.com) on X. They claim it with one login.**

Tuma lets you send USDC to someone's X (Twitter) handle even if they have never
used a wallet. The money sits in an on-chain escrow. The recipient opens a claim link,
signs in with X, pastes a wallet address, and the server releases the USDC to them —
paying the gas. If nobody claims within 30 days, the sender can refund.

Built for the Arc blockchain. USDC is Arc's native gas token, so the recipient needs no
gas and no prior setup.

## How it works

1. **Send** — the sender connects a wallet, enters the recipient's X handle and an amount,
   approves USDC, and deposits it into `TumaEscrow`. The app returns a claim link
   (`/claim/<id>`) and a **Share on X** button.
2. **Share** — the sender posts the link on X, tagging the recipient.
3. **Sign in** — the recipient opens the link and signs in with X (OAuth 2.0).
4. **Claim** — the server checks that the signed-in X username matches the payment's
   handle, then the operator wallet calls `release(id, recipient)` and pays the gas.
5. **Refund** — if the payment is still open after 30 days, the original sender can
   `refund(id)` from the `/payments` page.

No database. The contract is the source of truth.

## Deployed contracts

| Network      | TumaEscrow | Deploy block |
| ------------ | ---------- | ------------ |
| Arc Mainnet  | _not deployed yet_ | |
| Chain id     | `5042` | |
| USDC (ERC-20)| `0x3600000000000000000000000000000000000000` (6 decimals) | |
| Explorer     | https://explorer.arc.io | |

After running the deploy script, record the address and block here (not in `.env`).

## Stack

- **App:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
- **Web3:** wagmi v2 · viem · `@tanstack/react-query`
- **Auth:** Auth.js v5 (`next-auth` beta) with the Twitter/X OAuth 2.0 provider, JWT sessions
- **Contracts:** Solidity `^0.8.24` · Hardhat · OpenZeppelin 5

## Repo layout

```
app/                    Next.js routes
  page.tsx              /            Marketing landing page
  dashboard/page.tsx    /dashboard   Wallet, live rates, activity
  send/page.tsx         /send        4-step send wizard (recipient → amount → review → sent)
  payments/page.tsx     /payments    Activity feed + receipts + refunds
  profile/page.tsx      /profile     Profile & settings (localStorage)
  settings/page.tsx     /settings    Account, security, notifications, privacy
  claim/[id]/page.tsx   /claim/[id]  Claim (OAuth gate → release → success)
  (app)/admin/page.tsx  /admin       Protocol dashboard + operator tools
  api/claim/route.ts    POST /api/claim  (operator release)
  api/rates/route.ts    GET  /api/rates  (free USD FX rates)
  api/auth/[...nextauth]/route.ts
components/             Client UI (landing, dashboard, send wizard, activity, claim panel, admin, wallet button)
lib/                    arc chain config, ABIs, chain reads, event/admin queries, helpers
auth.ts                 Auth.js config (X username + id into the session)
types/                  next-auth type augmentation
contracts/              Hardhat project (contract, tests, deploy script)
docs/SETUP.md           Step-by-step setup (X developer app, env, wallets)
docs/DEMO.md            90-second demo script + judge talking points
```

Wallets: injected wallets via EIP-6963, an explicit **Zerion** target, and WalletConnect
(set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`) for mobile — including Zerion mobile.

## Admin

`/admin` shows protocol stats, contract addresses, and every payment with search, status
filters and CSV export. Write actions are wallet-gated on-chain: **set operator** requires
the contract owner, **force release** requires the operator. Read-only data is public chain
data, so the page is safe to leave in the build.

## Quickstart

```bash
# 1. Install
npm install
cd contracts && npm install && cd ..

# 2. Environment
cp .env.example .env.local
cp contracts/.env.example contracts/.env
# Fill in AUTH_SECRET, AUTH_TWITTER_ID/SECRET, OPERATOR_PRIVATE_KEY, DEPLOYER_PRIVATE_KEY.
# See docs/SETUP.md for the X developer app callback URL:
#   http://localhost:3000/api/auth/callback/twitter

# 3. Deploy the escrow to Arc Mainnet
cd contracts && npm run deploy:arc
# Copy the printed NEXT_PUBLIC_ESCROW_ADDRESS / NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK into .env.local

# 4. Run
npm run dev
```

Tuma runs on **Arc Mainnet**, so the deployer and operator wallets need a little real
USDC for gas (USDC is gas on Arc). Keep amounts small.

### Environment variables

| Name | Where | Purpose |
| ---- | ----- | ------- |
| `NEXT_PUBLIC_ARC_RPC` | client | Arc RPC endpoint |
| `NEXT_PUBLIC_USDC_ADDRESS` | client | USDC ERC-20 interface (6 decimals) |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | client | Deployed `TumaEscrow` |
| `NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK` | client | Block to start log scans from |
| `AUTH_SECRET` | server | Auth.js JWT secret (`npx auth secret`) |
| `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` | server | X OAuth 2.0 credentials |
| `OPERATOR_PRIVATE_KEY` | server | Wallet that calls `release()`. **Never** expose it |
| `DEPLOYER_PRIVATE_KEY` | contracts | Deploy only |
| `DATABASE_URL` | server | Postgres connection string (optional; enables persistence) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | client | WalletConnect / Zerion mobile (optional) |

## Database (optional)

The app runs fully without a database (it reads the chain directly). Set
`DATABASE_URL` to persist users, payments and the **on-chain tx hashes**:

```bash
# No Postgres installed? Start a local embedded one (no sudo needed):
npm run db:dev        # prints the DATABASE_URL to use, Ctrl+C to stop

# or point at any Postgres: local, Neon, Supabase, ...
echo 'DATABASE_URL=postgresql://user:pass@host:5432/tuma' >> .env.local
npx prisma db push          # create the tables
npm run dev
curl -X POST -H "x-admin-secret: $ADMIN_SECRET" localhost:3000/api/indexer   # backfill tx hashes
```

- Models live in `prisma/schema.prisma` (`User`, `Payment`, `Claim`, `Settings`, `IndexerState`).
- Deposits are cached with their tx hash by `POST /api/payments` (called from the send flow).
- Claims record the release tx hash in `POST /api/claim`.
- `POST /api/indexer` backfills everything from escrow events (idempotent).

## Contracts

```bash
cd contracts
npm run compile
npm test                 # 15 tests: deposit, handles, release, refund, operator
npm run deploy:arc       # prints the address and deploy block
```

`TumaEscrow` rules: handle is 1–15 chars of lowercase `a-z`, `0-9`, `_` (no `@`);
30-day claim period; `release` is operator-only; `refund` is sender-only after expiry;
`ReentrancyGuard` + checks-effects-interactions.

## Security

- **Security headers** (CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production) are set in
  `next.config.ts`.
- **`POST /api/payments`** requires a signed-in session **and verifies the referenced
  transaction on-chain** (decodes the `Deposited` event and checks id/sender/amount)
  before storing — records cannot be spoofed. Inputs are format- and length-validated.
- **`POST /api/indexer`** requires `ADMIN_SECRET` (`x-admin-secret` or
  `Authorization: Bearer`), is rate-limited, and fails closed without a configured escrow.
- **CSRF defense-in-depth**: state-changing routes reject cross-origin requests
  (`lib/http.ts`), on top of Auth.js's SameSite cookies.
- **Rate limiting** uses a Postgres `Throttle` table when a database is configured
  (survives restarts / multiple instances) and falls back to in-memory otherwise.
  One claim per payment is enforced by a unique constraint.
- **Secrets** are server-only (`OPERATOR_PRIVATE_KEY`, `ADMIN_SECRET`, `AUTH_SECRET`) and
  never exposed with `NEXT_PUBLIC_`. `.env*` is gitignored.
- Set `AUTH_URL` in production so callback URLs do not depend on the request Host header.

## Trust model (important)

The contract is trustless for **deposits** and **refunds**, but the **claim step is
trusted**:

- The operator is a hot wallet on the server. It decides who gets the money.
- The server matches the Auth.js X session to the payment handle and then calls
  `release`. A malicious or compromised operator could release a payment to the wrong
  address, or refuse to release it.
- The contract only enforces: operator-only release, one release per payment, and
  sender-only refund after expiry. It cannot verify the X login itself.

This is a deliberate hackathon trade-off to make claiming work for people with no wallet.
See **docs/DEMO.md** for how to explain it to judges, and the roadmap below.

## Roadmap

- Verify an X-bound wallet signature on-chain (e.g. signed message / EIP-712) so release
  does not depend on a trusted operator.
- Embedded wallets so recipients never install anything.
- Gasless deposits with EIP-2612 `permit`.
- QR code for the claim link, EURC support.
