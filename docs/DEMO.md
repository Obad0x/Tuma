# Tuma — demo script & judge notes

## 90-second demo

Pre-setup (do this before you present): operator + deployer wallets funded with test USDC,
`.env.local` filled in, two X accounts ready (a "sender" and a real "recipient"), and the
recipient's wallet address copied to the clipboard.

| Time | Do | Say |
| ---- | -- | ---- |
| 0:00 | Show the landing page | "Tuma sends USDC to an X handle. The recipient doesn't even need a wallet — they claim it with one login." |
| 0:08 | Connect wallet → auto-prompts switch to Arc Testnet | "We're on Arc Testnet. USDC is the gas token here." |
| 0:16 | Click **Get test USDC**, grab faucet funds | "Sender grabs testnet USDC from Circle's faucet." |
| 0:24 | Type the recipient's real `@handle`, enter `25`, click **Approve USDC**, then **Send USDC** | "Approve, then send. Two steps, one contract." |
| 0:40 | Show the claim link + click **Copy**, then **Share on X** to show the prefilled post | "Here's the claim link, and a ready-made post tagging them." |
| 0:52 | Open the link in a private window → **Sign in with X** as the recipient | "The recipient opens it, signs in with X." |
| 1:05 | Paste a wallet address, click **Claim USDC** | "The server verifies the X account matches the handle and releases the funds — paying the gas." |
| 1:18 | Show the ArcScan transaction link | "Settled on Arc. They had no wallet and paid no gas." |
| 1:26 | Switch to `/payments`, point at the status + **Refund** | "The sender tracks everything here and can refund anything unclaimed after 30 days." |
| 1:32 | Close | "Send money to an @handle. They claim it with one login." |

If the recipient X account isn't available, demo the wrong-account path on purpose: sign in
as the sender and show the clear "You're signed in as @a but this payment is for @b" error.

## 3 talking points for judges

1. **It works for people who don't have wallets.** The funds are escrowed on-chain and the
   recipient only proves an X login; the server pays the gas. That removes the two biggest
   onboarding walls (install a wallet, buy gas) for the person receiving money.

2. **Trust-minimized where it counts, and honest about where it isn't.** Deposits and
   30-day refunds are enforced by the contract, not the server. The claim step relies on a
   trusted operator because the contract can't verify an X login by itself — see the trust
   model below. That's a conscious trade-off, not a hidden one.

3. **Distribution is the product.** Money moves through social graphs, and X is where the
   recipients already are. The sender doesn't need the recipient's address, just their
   handle, and the claim link spreads in the same post.

## Trust model (say this plainly)

- **Trustless:** `deposit`, `release` constraints (operator-only, one per payment),
  `refund` (sender-only, after expiry). Nobody, including us, can move an open payment
  except through those rules.
- **Trusted:** the operator hot wallet and the server's match between the X session and the
  handle. A compromised operator key could release a payment to the wrong address or
  withhold it. The contract cannot independently verify who owns an X handle.
- **Mitigations / next step:** have the recipient sign a message with an X-bound wallet and
  verify that signature on-chain, so release no longer needs a trusted operator. Other
  options: time-locked operator with a co-signer, or a multisig operator.

## Submission checklist

```bash
git switch -c demo-stable
git tag v1.0-submission
git push -u origin demo-stable --tags
```

Record the deployed escrow address and block in `README.md` (own commit:
`docs: record Arc testnet deployment`).
