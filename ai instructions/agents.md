You are a senior full-stack Web3 engineer. Help me build "Tuma", a hackathon mini app on the Arc blockchain. Speed and a working demo matter more than polish.

WHAT TUMA IS
Tuma lets someone send USDC to a person's X (Twitter) handle, even if that person has never used Tuma and has no idea it exists. The money is held safely in an escrow contract. The sender gets a claim link to share on X, tagging the recipient. The recipient opens the link, logs in with X, proves they own that handle, and claims the USDC to their wallet. Pitch: "Send money to @handle on X. They claim it with one login."

HOW IT WORKS
1. Sender connects a wallet, types the recipient's X handle and an amount, approves USDC, and deposits it into the escrow contract.
2. The app shows a claim link (/claim/ID) plus a "Share on X" button that opens the X web intent with pre-filled text like "Hey @handle, I sent you 25 USDC on Tuma. Claim it here: <link>".
3. The recipient opens the link, signs in with X, and enters (or connects) the wallet address to receive the money.
4. The server checks that the signed-in X username matches the handle on the payment. If it matches, a trusted operator wallet on the server releases the USDC to the recipient's address and pays the gas, so the recipient needs no gas and no prior setup.
5. If nobody claims within 30 days, the sender can refund themselves.

ARC MAINNET FACTS (use exactly these)
- Chain ID: 5042
- RPC: https://rpc.mainnet.arc.io (fallbacks: https://rpc.blockdaemon.mainnet.arc.io, https://rpc.drpc.mainnet.arc.io, https://rpc.quicknode.mainnet.arc.io)
- Explorer: https://explorer.arc.io
- No faucet. This is mainnet, so USDC is real money. Keep demo amounts small.
- Arc is EVM-compatible, so Solidity, Hardhat, viem and wagmi all work.
- USDC is Arc's native gas token.
- USDC ERC-20 interface address: 0x3600000000000000000000000000000000000000 (6 decimals)
- DECIMALS TRAP: native USDC (gas) uses 18 decimals, the ERC-20 interface uses 6. For anything the user sees or sends, use only the ERC-20 interface with 6 decimals. Never send payments as native value.
- viem ships Arc as a built-in chain: import { arc } from "viem/chains" (do not hand-roll the chain unless you need an RPC override).
- If unsure about any Arc-specific detail, say so and tell me to check docs.arc.io. Do not invent addresses, APIs or package names.

SMART CONTRACT: TumaEscrow (Solidity ^0.8.24, Hardhat, OpenZeppelin)
- constructor(address usdc, address operator). Owner can change the operator (Ownable).
- struct Payment { address sender; uint256 amount; string handle; uint64 expiry; Status status } with Status { Open, Claimed, Refunded }.
- deposit(string handle, uint256 amount) returns (uint256 id): validates the handle (lowercase a-z, 0-9, underscore, 1-15 chars, no "@"), pulls USDC from the sender with SafeERC20 transferFrom, sets expiry to now + 30 days, and stores the payment.
- release(uint256 id, address to): onlyOperator, payment must be Open, sends USDC to "to", sets status Claimed.
- refund(uint256 id): only the original sender, only after expiry, only if Open.
- Events: Deposited(uint256 indexed id, address indexed sender, string handle, uint256 amount, uint64 expiry), Released(uint256 indexed id, address to), Refunded(uint256 indexed id).
- Use ReentrancyGuard and checks-effects-interactions.
- Hardhat tests covering: deposit, invalid handle, release only by operator, double release fails, release after refund fails, refund before expiry fails, refund after expiry works, refund by non-sender fails.
- Deploy script for Arc Mainnet reading DEPLOYER_PRIVATE_KEY and OPERATOR_ADDRESS from .env; print the contract address and deploy block number.

STACK
- Next.js (App Router) + TypeScript + Tailwind, one project for frontend and backend.
- wagmi v2 + viem for wallets and chain reads. Use viem's built-in Arc Mainnet chain (import { arc } from "viem/chains"; native currency name "USDC", symbol "USDC", decimals 18, plus RPC and explorer) with an optional NEXT_PUBLIC_ARC_RPC override.
- Auth.js (next-auth v5) with the Twitter/X provider using OAuth 2.0 (scopes: users.read tweet.read). JWT sessions, no database. In the callbacks, put the X username (lowercased) and X user id into the session.
- No database at all: the contract is the source of truth.

BACKEND: POST /api/claim  { id, recipient }
- Require a signed-in X session.
- Read the payment from the contract with viem. Reject if it is not Open, or the recipient is not a valid address (isAddress).
- Reject unless the session's X username (lowercase) equals the payment's handle. Return a clear error such as "You're signed in as @a but this payment is for @b."
- Call release(id, recipient) from a server-side operator wallet (OPERATOR_PRIVATE_KEY, server env only, never sent to the browser). Wait for the receipt and return the tx hash.
- Basic protection: a per-id in-memory lock so double-clicks don't send twice, and a simple rate limit.
- Friendly errors for every failure.

FRONTEND PAGES
1. / (Send): connect wallet (injected) with a prompt to add/switch to Arc. Handle input (strip "@", lowercase, validate). Amount input. Show the user's USDC balance (no faucet — this is mainnet, so USDC is real). Two clear steps: "Approve USDC" then "Send". After success, read the Deposited event to get the id, then show the claim link with Copy and "Share on X" (use https://x.com/intent/post?text=...&url=...). Show a warning before sending: "Only the X account @handle can claim this. Double-check the spelling. If unclaimed after 30 days you can refund it."
2. /claim/[id]: read the payment from chain and show: amount, sender (shortened), recipient @handle, and status. Then:
   - Not signed in: "Sign in with X" button.
   - Signed in as the wrong account: explain and offer to sign out.
   - Signed in as the right account: field to paste a wallet address (or connect a wallet), then a "Claim" button. On success show the Arc Explorer link and a short note on how to see USDC in their wallet on Arc.
   - Already claimed, refunded or expired: show that state clearly.
3. /payments: the sender's payments (read Deposited events filtered by sender, from the deploy block, in chunks to respect RPC limits). Show handle, amount, status, a copy-link button, and a Refund button when it is Open and expired.

ENV VARIABLES (provide .env.example)
NEXT_PUBLIC_ARC_RPC, NEXT_PUBLIC_ESCROW_ADDRESS, NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK, NEXT_PUBLIC_USDC_ADDRESS, AUTH_SECRET, AUTH_TWITTER_ID, AUTH_TWITTER_SECRET, OPERATOR_PRIVATE_KEY, DEPLOYER_PRIVATE_KEY. Never commit secrets. Add .gitignore.

UX
Mobile-first, clean, works in dark mode. The recipient may be a non-crypto person, so use plain English and hide anything technical. Friendly errors (rejected transaction, not enough USDC, wrong network, wrong X account, already claimed).

STRETCH (only after the MVP works, and ask me first): embedded wallets so recipients don't need their own wallet, a gasless deposit with EIP-2612 permit, QR code for the claim link, EURC support.

HOW TO WORK (important)
- Work in stages and STOP after each one until I say "next":
  Stage 1: file tree, install commands, and step-by-step setup of the X developer app (including the callback URL http://localhost:3000/api/auth/callback/twitter).
  Stage 2: smart contract, tests, deploy script.
  Stage 3: foundation (chain config, wagmi setup, ABIs, Auth.js with X).
  Stage 4: the Send page and claim link.
  Stage 5: the claim page and /api/claim.
  Stage 6: /payments page with refund.
  Stage 7: README, a 90-second demo script, and 3 talking points for judges, including an honest note on the trust model.
- For every file, give the full path and complete contents. No "rest of code here" and no placeholders other than env vars.
- Keep the code simple and readable. Add comments only where something is non-obvious.
- Use package versions you are sure exist. If unsure, use the latest stable and tell me.
- State your assumptions in one line and start Stage 1. Only ask questions if you are truly blocked.
- At the end of every stage, after the code, add a "GIT" block with the exact branch, add, commit, merge and tag commands for that stage, in the order I should run them.
- If I paste an error, first ask whether I'm on a feature or experiment branch, and fix it there, not on main.
GIT WORKFLOW (follow this for every stage)
- Use plain git commands. Show them as a copy-paste block at the end of each stage, in order.
- Before the first stage, give me: git init, create .gitignore FIRST (node_modules, .env, .env.local, artifacts, cache, .next), then "git add .gitignore" and commit "chore: initial commit with gitignore". Rename the branch to main.
- Never commit secrets. Before every commit, show "git status" and tell me to confirm no .env file is staged.
- One branch per feature, created from an up-to-date main:
    feat/contract-escrow
    feat/foundation
    feat/send-flow
    feat/claim-flow
    feat/payments-refund
    docs/readme-demo
- Bug fixes: fix/<short-name>. Risky experiments or testing something out: experiment/<short-name>. Never test on main.
- Make small commits inside each branch (for example: contract, tests, deploy script as three separate commits), not one big commit per stage.
- Commit messages use the Conventional Commits style: feat:, fix:, test:, docs:, chore:, refactor:. Keep them under 72 characters and say what changed.
- When a stage works, give me the merge commands:
    git switch main
    git merge --no-ff <branch> -m "merge: <branch>"
    git tag v0.<stage number>-<short-name>
- If an experiment fails, give me the commands to throw it away:
    git switch main
    git branch -D experiment/<name>
- If I hit a bug after merging, tell me how to go back with git revert or by switching to the last tag. Do not use "git reset --hard" unless I ask.
- After deploying the contract, commit the deployed address and deploy block in the README (not in .env) on its own commit: "docs: record Arc mainnet deployment".
- Give me the commands to create a GitHub repo, add the remote, and push main and all tags (git remote add origin <url>, git push -u origin main, git push --tags), then "git push -u origin <branch>" for feature branches.
- Before the hackathon submission, tell me to create a stable branch: git switch -c demo-stable, tag it "v1.0-submission", and push it, so the judged version can't be changed by accident.
