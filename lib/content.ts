export type ArticleSection = {
  heading: string;
  body: string[];
};

export type ArticleFAQ = {
  question: string;
  answer: string;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  updated: string;
  readingMinutes: number;
  intro: string;
  sections: ArticleSection[];
  faqs: ArticleFAQ[];
};

export const ARTICLES: Article[] = [
  {
    slug: "how-to-send-usdc-to-an-x-handle",
    title: "How to send USDC to an X (Twitter) handle",
    description:
      "A step-by-step guide to sending USDC to someone's X (Twitter) handle with Tuma — no wallet address required, held in on-chain escrow on Arc until they claim.",
    keywords: [
      "how to send USDC to an X handle",
      "send USDC to Twitter",
      "send crypto to a Twitter handle",
      "USDC transfer to X",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 4,
    intro:
      "You do not need a wallet address to send someone USDC anymore. Tuma lets you address a payment to an X (Twitter) handle. The recipient claims it with one login, and the funds stay in escrow until they do.",
    sections: [
      {
        heading: "What you need before you start",
        body: [
          "A wallet with USDC on the Arc network, and the exact X handle of the person you want to pay. The handle is the address — spelling matters, because only that account can claim the funds.",
          "You do not need the recipient's wallet address, bank details, or permission to contact them first. Tuma creates a claim link you can share however you like.",
        ],
      },
      {
        heading: "Step 1 — Connect your wallet",
        body: [
          "Open Tuma and connect the wallet that holds your USDC. You can use an injected browser wallet, Zerion, or WalletConnect on mobile. Arc uses USDC as its native gas token, so the same balance pays the network fee for your deposit.",
        ],
      },
      {
        heading: "Step 2 — Enter the handle and the amount",
        body: [
          "Type the recipient's X handle (for example @mary_k) and the amount in USDC. Tuma shows the live rate in the recipient's local currency, so you can see roughly what they will receive.",
          "When you confirm, you approve USDC and the amount is deposited into the TumaEscrow contract on Arc. From that moment the funds are locked in code, not held by Tuma.",
        ],
      },
      {
        heading: "Step 3 — Share the claim link",
        body: [
          "Tuma returns a claim link such as /claim/42 and a ready-made post for X. Send the link to the recipient any way you want, or post it publicly and tag them.",
          "The link does not require the recipient to have a wallet. It only requires them to sign in with the X account the payment was addressed to.",
        ],
      },
      {
        heading: "Step 4 — They claim with one login",
        body: [
          "When the recipient opens the link, they sign in with X. Tuma verifies that the signed-in account matches the handle on the payment, then the operator releases the USDC to the wallet address they paste in.",
          "Tuma pays the gas for the release, so the recipient needs no USDC to claim. They can send the funds onward or hold them.",
        ],
      },
      {
        heading: "What if they never claim?",
        body: [
          "If a payment is still unclaimed after 30 days, you can refund it from the Activity page. Refunds are sender-only and enforced by the smart contract, so you do not need to ask Tuma for permission.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need the recipient's wallet address to send USDC?",
        answer:
          "No. You address the payment to their X handle. They only provide a wallet address at the moment they claim.",
      },
      {
        question: "Can I send USDC to someone who has never used crypto?",
        answer:
          "Yes. That is the main use case. They sign in with X, paste a wallet address, and the operator releases the funds and pays the gas.",
      },
      {
        question: "What happens if I misspell the handle?",
        answer:
          "Only the exact X account matching the handle can claim the payment. If it is unclaimed after 30 days, you can refund it from the Activity page.",
      },
    ],
  },
  {
    slug: "how-to-receive-usdc-without-a-wallet",
    title: "How to receive USDC without a crypto wallet",
    description:
      "Never used crypto? Learn how to receive USDC sent to your X handle on Arc, claim it with one login, and paste a wallet address only when you are ready.",
    keywords: [
      "receive USDC without a wallet",
      "claim USDC with X login",
      "how to receive crypto without wallet",
      "receive USDC for beginners",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 4,
    intro:
      "Receiving crypto used to mean installing an app, writing down a seed phrase and paying gas. With Tuma you can receive USDC that was sent to your X handle without any of that setup — you only need a wallet address at the final step.",
    sections: [
      {
        heading: "Why you do not need a wallet to start",
        body: [
          "When someone sends you USDC through Tuma, the funds are held in an on-chain escrow contract on Arc. They cannot disappear while they wait for you, and nobody else can claim them.",
          "You do not need a wallet, a seed phrase, or gas to open the claim link. You only need to be able to sign in to the X account the payment was addressed to.",
        ],
      },
      {
        heading: "Step 1 — Open your claim link",
        body: [
          "Open the /claim/... link that was shared with you. Tuma shows the amount, the sender, and the expiry. If you do not have the link, ask the sender to resend it.",
        ],
      },
      {
        heading: "Step 2 — Sign in with X",
        body: [
          "Sign in with the X account the payment was addressed to. Tuma uses X OAuth 2.0, which means you never share your password. Tuma only receives your numeric X id, handle, display name and profile image.",
          "If you sign in with a different account, the claim will not match and the funds will stay locked.",
        ],
      },
      {
        heading: "Step 3 — Paste a wallet address",
        body: [
          "Paste the wallet address where you want the USDC delivered. This can be a wallet you already use, or a new address from any wallet app. Double-check it, because blockchain transfers are irreversible.",
          "The operator then releases the funds to that address and pays the network fee. You do not need any USDC to claim.",
        ],
      },
      {
        heading: "Step 4 — Receive your USDC",
        body: [
          "Within seconds the USDC is in your wallet. From there you can hold it, send it to a friend through Tuma, or convert it using any service that accepts USDC on Arc.",
        ],
      },
      {
        heading: "Safety tips for your first claim",
        body: [
          "Always open claim links from the official Tuma domain. Check that the page shows the correct amount and handle before you sign in.",
          "Tuma will never ask for your seed phrase or private key. Anyone who does is trying to steal from you.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to buy crypto before I can claim?",
        answer:
          "No. The sender deposits the USDC and Tuma pays the gas for the release, so you can claim with a zero balance.",
      },
      {
        question: "Is it safe to sign in with X?",
        answer:
          "Yes. X OAuth 2.0 never shares your password. Tuma receives only your public profile basics and a numeric account id.",
      },
    ],
  },
  {
    slug: "send-money-to-nigeria-with-usdc",
    title: "Send money to Nigeria with USDC — fees, speed and steps",
    description:
      "How to send money to Nigeria with USDC on Arc: no bank details, live NGN rates, escrow protection and claims with one X login. A practical guide for the diaspora.",
    keywords: [
      "send money to Nigeria with USDC",
      "USDC to NGN",
      "cheapest way to send money to Nigeria",
      "send crypto to Nigeria",
      "diaspora remittance Nigeria",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 5,
    intro:
      "Nigeria is one of the largest remittance markets in the world, and one of the most expensive to send money to. USDC on Arc offers a fast, low-cost alternative — if you know how to move it and how the recipient gets value.",
    sections: [
      {
        heading: "Why USDC instead of a bank transfer",
        body: [
          "Traditional remittance routes charge a fee plus a currency spread, and can take anywhere from minutes to several days. A USDC transfer settles in seconds and the only network cost on Arc is gas, which USDC itself pays.",
          "The trade-off is that the recipient ends up holding USDC rather than naira. For many people that is fine — they can convert at a local exchange or spend it — but it is worth agreeing on up front.",
        ],
      },
      {
        heading: "What the transfer actually costs",
        body: [
          "Tuma charges no protocol fee. The sender pays Arc network gas to deposit into escrow, and Tuma pays the gas for the release. Recipients never pay to claim.",
          "The live rate shown in the app is an estimate of the NGN value. It is not a guaranteed exchange rate, so treat it as a guide rather than a promise.",
        ],
      },
      {
        heading: "The problem Tuma solves: no bank details",
        body: [
          "To send money to Nigeria the traditional way you need an account number, a bank name, and often a phone number. With Tuma you only need the person's X handle.",
          "That matters when the recipient is a contributor, a friend, or family who would rather not share banking details, or when you only know them by their X account.",
        ],
      },
      {
        heading: "Step by step",
        body: [
          "1. Ask for the recipient's X handle. 2. Connect your wallet and enter the handle and amount in USDC. 3. Approve the deposit into the TumaEscrow contract on Arc. 4. Share the claim link, tagging them on X if you like. 5. They sign in with X, paste a wallet address, and receive the USDC.",
          "If they do not claim within 30 days, you can refund the payment from the Activity page.",
        ],
      },
      {
        heading: "Getting from USDC to naira",
        body: [
          "Once the recipient holds USDC they can convert to NGN through a local exchange or P2P marketplace, or hold it as a dollar-denominated balance. Rates vary by provider, so it is worth comparing before converting.",
        ],
      },
    ],
    faqs: [
      {
        question: "How fast does a USDC transfer to Nigeria arrive?",
        answer:
          "The on-chain release happens in seconds. The recipient can then convert to naira through a local provider, which is the only step that depends on a third party.",
      },
      {
        question: "Is sending USDC to Nigeria cheaper than a bank transfer?",
        answer:
          "Tuma charges no protocol fee, so you mainly pay a small Arc network gas cost on deposit. That is usually far below the fee plus FX spread on a traditional remittance.",
      },
    ],
  },
  {
    slug: "what-is-arc-blockchain",
    title: "What is Arc, and why USDC is its gas token",
    description:
      "Arc is a USDC-native blockchain where the dollar stablecoin is also the gas token. Here is why that makes transfers feel like normal money movement.",
    keywords: [
      "what is Arc blockchain",
      "Arc network USDC",
      "USDC gas token",
      "Arc mainnet",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 3,
    intro:
      "Most blockchains make you hold a volatile token just to pay fees. Arc takes a different approach: USDC is the native asset, so the money you send and the money you pay for gas are the same thing.",
    sections: [
      {
        heading: "USDC is the gas token",
        body: [
          "On Arc, transaction fees are paid in USDC rather than a separate network token. That removes a whole class of friction — you do not need to buy ETH or anything else before you can move dollars.",
          "It also makes costs predictable. The fee is denominated in the same unit as the value being transferred.",
        ],
      },
      {
        heading: "Why stablecoin-native chains matter",
        body: [
          "If you are sending dollars to a person, you think in dollars. A chain that settles in dollars matches the mental model of a payment, not a trade.",
          "Stablecoin-native settlement is especially useful for remittances, payouts to contributors, and any use case where the recipient should not have to think about crypto prices.",
        ],
      },
      {
        heading: "How Tuma uses Arc",
        body: [
          "Tuma's escrow contract, TumaEscrow, lives on Arc. A sender deposits USDC, the contract holds it, and the operator releases it to the recipient after they verify their X handle.",
          "Because USDC is the gas token, the recipient can claim without holding any separate asset, and the operator can pay the release gas from the same pool.",
        ],
      },
      {
        heading: "What to check before you send",
        body: [
          "Make sure your wallet is on the Arc network and holds USDC. Verify contract addresses from the official Tuma site or the Arc explorer before approving any transaction.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need ETH to use Arc?",
        answer:
          "No. Arc uses USDC as its native gas token, so you pay fees in USDC rather than ETH.",
      },
      {
        question: "Is Arc a separate token?",
        answer:
          "Arc's native asset is USDC. You do not need to acquire a separate network token to transact.",
      },
    ],
  },
  {
    slug: "are-crypto-transfers-to-twitter-handles-safe",
    title: "Is sending crypto to a Twitter handle safe? Escrow explained",
    description:
      "Escrow, X-verified claims, 30-day refunds and a trusted operator: how Tuma protects a crypto transfer to an X handle, and the trade-offs you should know.",
    keywords: [
      "send crypto to Twitter safe",
      "crypto escrow",
      "USDC escrow",
      "X verified claim",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 4,
    intro:
      "Sending money to a social media handle sounds risky. Tuma reduces the risk with on-chain escrow, identity-verified claims, refunds and transparent rules — but no system is risk-free, and it is worth understanding exactly where the trust sits.",
    sections: [
      {
        heading: "Funds are escrowed on-chain, not held by Tuma",
        body: [
          "When you send a payment, the USDC goes into the TumaEscrow smart contract on Arc. Tuma does not custody it. The contract enforces the deposit and refund rules in code.",
          "That means there is no central balance to freeze or lose: the money sits at a contract address that anyone can inspect on the Arc explorer.",
        ],
      },
      {
        heading: "Only the right X account can claim",
        body: [
          "Payments are addressed to a specific X handle. To claim, the recipient signs in with X, and Tuma verifies that the signed-in account matches the handle before releasing anything.",
          "A stranger who finds the claim link cannot redirect the funds, because they cannot sign in as the intended recipient.",
        ],
      },
      {
        heading: "Refunds protect the sender",
        body: [
          "If a payment is not claimed within 30 days, the original sender can refund it. The contract allows sender-only refunds after the claim period, so a typo does not mean the money is gone forever.",
        ],
      },
      {
        heading: "The trust assumption to understand",
        body: [
          "The release step uses a trusted operator wallet that pays the gas on the recipient's behalf. In principle, a compromised operator could release a payment to the wrong address.",
          "This trade-off exists so that recipients can claim without setting up a wallet or buying gas. It is disclosed openly in Tuma's Consumer Disclosure, and reducing it is an active design goal.",
        ],
      },
      {
        heading: "Practical safety habits",
        body: [
          "Always use the official Tuma domain, confirm the amount and handle before you deposit, and never share a seed phrase or private key with anyone.",
          "Because blockchain transfers are irreversible, treat the handle the same way you would treat an account number: read it twice before sending.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can someone steal a claim link and take the money?",
        answer:
          "No. Even with the link, only the X account the payment was addressed to can complete the claim.",
      },
      {
        question: "What if the recipient never claims?",
        answer:
          "After 30 days the sender can refund the payment directly from the Activity page, without asking Tuma.",
      },
    ],
  },
  {
    slug: "usdc-vs-bank-transfer-vs-wise-for-nigeria",
    title: "USDC vs bank transfer vs Wise for sending money to Nigeria",
    description:
      "A practical comparison of sending money to Nigeria with USDC, a bank transfer and Wise — covering cost, speed, recipient experience and when each one wins.",
    keywords: [
      "USDC vs Wise Nigeria",
      "send money to Nigeria comparison",
      "cheapest way to send money to Nigeria",
      "bank transfer vs crypto Nigeria",
    ],
    date: "2026-09-23",
    updated: "2026-09-23",
    readingMinutes: 5,
    intro:
      "There is no single best way to send money to Nigeria. The right choice depends on cost, speed, and what the recipient can actually do with the money. Here is how USDC, a bank transfer and Wise compare.",
    sections: [
      {
        heading: "Cost",
        body: [
          "Bank transfers and remittance apps typically charge a transfer fee plus a markup hidden in the exchange rate. Wise is known for transparent pricing and a mid-market rate with a visible fee.",
          "A USDC transfer on Arc has no protocol fee from Tuma; the sender pays only network gas to deposit. The recipient may pay a spread when converting USDC to naira through a local provider, so compare that conversion cost too.",
        ],
      },
      {
        heading: "Speed",
        body: [
          "Wise and bank transfers can be fast but often depend on cut-off times and intermediary banks. USDC on Arc settles in seconds, and the release happens as soon as the recipient verifies their X handle.",
        ],
      },
      {
        heading: "Recipient experience",
        body: [
          "A bank transfer or Wise payment lands as naira in a bank account, which is familiar. USDC lands as a dollar-denominated token that the recipient must convert to spend locally.",
          "Tuma's twist is that the recipient does not need a wallet address up front — just an X handle — and claiming is one login. That is useful when you do not have their bank details.",
        ],
      },
      {
        heading: "Protection and reversibility",
        body: [
          "Bank transfers can sometimes be recalled; blockchain transfers cannot. Tuma adds a 30-day refund window for unclaimed payments, which restores some of that protection without making the transfer reversible after a claim.",
        ],
      },
      {
        heading: "When each one wins",
        body: [
          "Choose a bank transfer or Wise when the recipient wants naira in a bank account and you already have their details. Choose USDC on Arc when you only have their X handle, want speed, and the recipient is comfortable holding or converting a stablecoin.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is USDC cheaper than Wise to send to Nigeria?",
        answer:
          "There is no protocol fee on Tuma, and network gas on Arc is small. Compare that against the recipient's cost to convert USDC to naira, plus any Wise fee and FX markup.",
      },
      {
        question: "Can I send to someone who only has a bank account?",
        answer:
          "Tuma requires the recipient to hold or create a wallet address to receive USDC. If they only want naira in a bank account, a traditional transfer may fit better.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export const LANDING_FAQS: ArticleFAQ[] = [
  {
    question: "What is Tuma?",
    answer:
      "Tuma lets you send USDC to someone's X (Twitter) handle. The money sits in an on-chain escrow on Arc until the recipient claims it with one login — no wallet, gas or setup required for them.",
  },
  {
    question: "Do recipients need a crypto wallet to be paid?",
    answer:
      "No. The payment is addressed to their X handle. They only need to sign in with X and paste a wallet address at the moment they claim.",
  },
  {
    question: "How does the recipient claim the money?",
    answer:
      "They open the claim link, sign in with the X account the payment was addressed to, paste a wallet address, and Tuma releases the USDC while paying the gas.",
  },
  {
    question: "What happens if they never claim?",
    answer:
      "If a payment is still unclaimed after 30 days, the sender can refund it from the Activity page. Refunds are sender-only and enforced by the smart contract.",
  },
  {
    question: "How much does Tuma cost?",
    answer:
      "Tuma charges no protocol fee. The sender pays a small Arc network gas cost to deposit, and Tuma pays the gas for the release.",
  },
  {
    question: "Which network and currency does Tuma use?",
    answer:
      "Tuma runs on the Arc network, where USDC is the native gas token, so sending, claiming and paying fees all use USDC.",
  },
];

