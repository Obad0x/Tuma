# Tuma

**Send USDC to an X handle. They claim it with one login.**

Live app: https://tuma-psi.vercel.app

Tuma lets you send USDC to someone's X (Twitter) handle, even if they have never used a wallet. The funds sit in an on-chain escrow. The recipient opens a claim link, signs in with X, pastes a wallet address, and the server releases the USDC to them and pays the gas. If nobody claims within 30 days, the sender can refund.

Built on **Arc**, where USDC is the native gas token, so recipients need no gas and no prior setup.

## How it works

1. **Send:** the sender connects a wallet, enters the recipient's X handle and an amount, approves USDC, and deposits into `TumaEscrow`. The app returns a claim link (`/claim/<id>`) and a Share on X button.
2. **Share:** the sender posts the link on X, tagging the recipient.
3. **Sign in:** the recipient opens the link and signs in with X (OAuth 2.0).
4. **Claim:** the server checks that the signed-in X username matches the payment's handle, then the operator wallet calls `release(id, recipient)` and pays the gas.
5. **Refund:** if the payment is still open after 30 days, the original sender can call `refund(id)` from the `/payments` page.

The contract is the source of truth. A Postgres database is optional and only caches users, payments and tx hashes.

## Deployed contracts

| Item | Value |
| --- | --- |
| Network | Arc Mainnet (chain id `5042`) |
| TumaEscrow | `0xCc934ED5Ce63477de443bd07891914D50Cf4D078` |
| Deploy block | `26010289` |
| USDC (ERC-20, 6 decimals) | `0x3600000000000000000000000000000000000000` |
| Explorer | https://explorer.arc.io |

## Stack

- **App:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Web3:** wagmi v2, viem, TanStack Query
- **Auth:** Auth.js v5 with the X (Twitter) OAuth 2.0 provider, JWT sessions
- **Storage:** Supabase Storage for avatars, Postgres via Prisma (optional)
- **Contracts:** Solidity ^0.8.24, Hardhat, OpenZeppelin 5
- **Hosting:** Vercel

## Repo layout

```
app/                    Next.js routes
  page.tsx              /            Landing page
  dashboard/            /dashboard   Wallet, live rates, activity
  send/                 /send        Send wizard (recipient, amount, review, sent)
  payments/             /payments    Activity feed, receipts, refunds
  profile/              /profile     Profile, avatar upload, payment QR
  support/              /support     Support tickets
  status/               /status      System health
  legal/[slug]/         /legal/*     Privacy, Terms, AML, Consumer Disclosure
  claim/[id]/           /claim/[id]  Claim flow (X sign-in, release, success)
  api/                  claim, payments, indexer, tickets, profile, upload, rates, admin
components/             Client UI
lib/                    Arc config, ABIs, chain reads, db, storage, helpers
auth.ts                 Auth.js config
contracts/              Hardhat project (contract, tests, deploy script)
prisma/                 Database schema
docs/                   Setup guide and demo script
```

Wallets: injected wallets (EIP-6963), an explicit Zerion target, and WalletConnect for mobile wallets via Reown AppKit. AppKit is on by default with the committed public project ID; set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=off` to only offer injected wallets.

## Quickstart

```bash
# 1. Install
npm install
cd contracts && npm install && cd ..

# 2. Environment
cp .env.example .env.local
cp contracts/.env.example contracts/.env

# 3. Deploy the escrow to Arc Mainnet
cd contracts && npm run deploy:arc
# Put the printed address and block into NEXT_PUBLIC_ESCROW_ADDRESS / NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK

# 4. (Optional) Database
npx prisma db push

# 5. Run
npm run dev
```

Arc is a mainnet, so the deployer and operator wallets need a small amount of real USDC for gas. Keep amounts small.

## Environment variables

### Public (safe to expose, baked in at build time)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ARC_RPC` | Arc RPC endpoint |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC ERC-20 interface |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | Deployed `TumaEscrow` |
| `NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK` | Block to start log scans from |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown project ID (a default is built in; set to `off` to disable WalletConnect) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console token (optional) |

### Server-only secrets

| Name | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js JWT secret (`npx auth secret`) |
| `AUTH_URL` | Public deployment URL, e.g. `https://tuma-psi.vercel.app` |
| `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` | X OAuth 2.0 Client ID and Secret |
| `OPERATOR_PRIVATE_KEY` | Wallet that calls `release()`. Never expose |
| `ADMIN_SECRET` | Protects admin routes and `POST /api/indexer` |
| `DATABASE_URL` | Postgres connection string (optional) |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | Avatar storage on serverless hosts |
| `DEPLOYER_PRIVATE_KEY` | Contract deployment only (`contracts/`, never on Vercel) |

### X developer app

Enable OAuth 2.0 with a confidential client (Web App) and add these callback URLs:

```
https://tuma-psi.vercel.app/api/auth/callback/twitter
http://localhost:3000/api/auth/callback/twitter
```

### Deploying on Vercel

Add the secrets in Project Settings, Environment Variables, and mark them Sensitive. The public `NEXT_PUBLIC_` values can live in a committed `.env.production`, but any variable also set in the Vercel dashboard wins over the file. Leave the escrow values blank (or set them in the dashboard): placeholder text like `<deploy block>` is parsed at build time and fails the production build. Redeploy after any change, since public values are baked in at build time.

## Database (optional)

The app runs without a database by reading the chain directly. Set `DATABASE_URL` to persist users, payments and on-chain tx hashes.

```bash
npx prisma db push
curl -X POST -H "x-admin-secret: $ADMIN_SECRET" https://tuma-psi.vercel.app/api/indexer
```

- Models: `User`, `Payment`, `Claim`, `Settings`, `IndexerState`, `Throttle`.
- `POST /api/payments` caches deposits with their tx hash.
- `POST /api/claim` records the release tx hash.
- `POST /api/indexer` backfills everything from escrow events (idempotent).

## Contracts

```bash
cd contracts
npm run compile
npm test            # deposit, handles, release, refund, operator
npm run deploy:arc  # prints the address and deploy block
```

`TumaEscrow` rules: handles are 1 to 15 chars of lowercase `a-z`, `0-9`, `_` (no `@`); 30-day claim period; `release` is operator-only; `refund` is sender-only after expiry; `ReentrancyGuard` and checks-effects-interactions throughout.

## Security

- Security headers (CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production) are set in `next.config.ts`.
- `POST /api/payments` requires a signed-in session and verifies the transaction on-chain (decodes the `Deposited` event and checks id, sender and amount) before storing anything.
- `POST /api/indexer` requires `ADMIN_SECRET`, is rate-limited, and fails closed without a configured escrow.
- State-changing routes reject cross-origin requests, on top of Auth.js SameSite cookies.
- Rate limiting uses a Postgres `Throttle` table when a database is configured, with an in-memory fallback. One claim per payment is enforced by a unique constraint.
- Secrets are server-only and never use the `NEXT_PUBLIC_` prefix. `.env*` is gitignored, except `.env.production`, which holds public values only.

## Trust model

The contract is trustless for **deposits** and **refunds**, but the **claim step is trusted**:

- The operator is a hot wallet on the server and decides who receives the funds.
- The server matches the Auth.js X session to the payment's handle, then calls `release`. A compromised operator could release a payment to the wrong address or refuse to release it.
- The contract enforces only: operator-only release, one release per payment, and sender-only refund after expiry. It cannot verify the X login itself.

This is a deliberate trade-off that makes claiming work for people with no wallet.

## Roadmap

- Verify an X-bound wallet signature on-chain (EIP-712) so release does not depend on a trusted operator.
- Embedded wallets so recipients never install anything.
- Gasless deposits with EIP-2612 `permit`.
- EURC support.

## Contact

Support: use the in-app `/support` page.