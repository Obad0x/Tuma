# Tuma setup (Stage 1)

Everything you need to get the backend running locally.

## 1. Install

```bash
# Next.js app (repo root)
npm install

# Smart contracts (separate package)
cd contracts && npm install && cd ..
```

## 2. Create the X (Twitter) developer app

1. Go to https://developer.x.com and sign in with the X account you want to own the app.
2. Apply for a developer account if you have not already (the Free tier is enough for OAuth 2.0 login).
3. Create a **Project**, then create an **App** inside it.
4. Open the app's **User authentication settings** and click **Set up**:
   - **App permissions**: `Read`
   - **Type of App**: `Web App, Automated App or Bot`
   - **Callback URI / Redirect URL**:
     ```
     http://localhost:3000/api/auth/callback/twitter
     ```
   - **Website URL**: `http://localhost:3000`
5. Save. Copy the **OAuth 2.0 Client ID** and **Client Secret**.
6. Make sure the app uses OAuth 2.0 scopes `users.read` and `tweet.read` (Auth.js requests these for you).

> Add your production callback URL later (e.g. `https://your-app.vercel.app/api/auth/callback/twitter`) when you deploy.

## 3. Environment files

```bash
cp .env.example .env.local
cp contracts/.env.example contracts/.env
```

Fill in:

- `AUTH_SECRET` — generate with `npx auth secret`
- `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` — from step 2
- `OPERATOR_PRIVATE_KEY` — a throwaway wallet the server uses to pay gas and release funds
- `contracts/.env`: `DEPLOYER_PRIVATE_KEY` and `OPERATOR_ADDRESS` (the address of the operator wallet)

> `DEPLOYER_PRIVATE_KEY` lives only in `contracts/.env`. The Next app never needs it.

## 4. Fund the wallets

- Go to https://faucet.circle.com, pick **Arc Testnet**, then **USDC**.
- Send test USDC to both the deployer and operator wallet addresses.
- USDC is Arc's native gas token, so the operator needs a balance to pay for `release()`.

## 5. Contract env values

`NEXT_PUBLIC_ARC_RPC` and `NEXT_PUBLIC_USDC_ADDRESS` already default to the values below:

- RPC: `https://rpc.testnet.arc.network`
- USDC ERC-20: `0x3600000000000000000000000000000000000000` (6 decimals)
- Explorer: https://testnet.arcscan.app

`NEXT_PUBLIC_ESCROW_ADDRESS` and `NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK` are filled in after the Stage 2 deployment.
