export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "September 2026",
    intro:
      "This policy explains what data Tuma collects, why, and the choices you have. Tuma is a non-custodial service built on the Arc network; most payment data lives on a public blockchain and is inherently public.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Account data from X (Twitter) OAuth 2.0 when you sign in: your numeric X user id, your username handle, your display name and profile image. We never receive your X password.",
          "Wallet data: the public wallet address you connect or paste. We do not collect private keys and cannot move funds without an on-chain signature or the operator release you trigger.",
          "Usage data: the pages you visit and the actions you take in the app, kept to operate and secure the service.",
        ],
      },
      {
        heading: "On-chain data",
        body: [
          "Payments, releases, refunds, amounts, handles and wallet addresses are recorded on the public Arc blockchain in the TumaEscrow contract. This data is permanent and visible to anyone.",
          "Because blockchain records are immutable, we cannot delete on-chain data on request.",
        ],
      },
      {
        heading: "How we use data",
        body: [
          "To operate the escrow flow, verify that the signed-in X account matches the payment handle, release funds, prevent fraud and abuse, and provide support.",
          "We do not sell your personal data.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "With infrastructure providers (hosting, database, RPC and FX rate providers) strictly to run the service.",
          "Where required by law, or to protect the rights, safety and security of users and the service.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "You can sign out and clear locally stored preferences at any time.",
          "You can request access to, or deletion of, the off-chain data we hold (profile settings and support tickets) by opening a ticket from the Support page.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    updated: "September 2026",
    intro:
      "By using Tuma you agree to these terms. Tuma is experimental software provided for a testnet/demo context and is not a bank or money transmitter.",
    sections: [
      {
        heading: "The service",
        body: [
          "Tuma lets a sender deposit USDC into an escrow smart contract addressed to an X handle, and lets the owner of that handle claim the funds after signing in with X.",
          "The smart contract enforces: operator-only release, one release per payment, and sender-only refund after the 30-day claim period.",
        ],
      },
      {
        heading: "Your responsibilities",
        body: [
          "Provide an accurate recipient handle. Only the X account matching the stored handle can claim the payment.",
          "You are responsible for the security of your wallet and any private keys.",
          "Do not use Tuma for unlawful activity, sanctions evasion, or to move funds you do not lawfully control.",
        ],
      },
      {
        heading: "Fees and network costs",
        body: [
          "Tuma charges no protocol fee. You pay Arc network gas for deposits; Tuma pays gas for the operator release. Arc uses USDC as its native gas token.",
        ],
      },
      {
        heading: "No warranty and limitation of liability",
        body: [
          "The service and contracts are provided \"as is\" without warranties. To the maximum extent permitted by law, Tuma is not liable for indirect or consequential losses, or for losses arising from blockchain congestion, third-party services, or misuse.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms. Continued use after an update constitutes acceptance of the revised terms.",
        ],
      },
    ],
  },
  {
    slug: "aml",
    title: "AML Compliance",
    updated: "September 2026",
    intro:
      "Tuma is designed to be transparent by default. This page describes our approach to anti-money-laundering (AML) and counter-terrorist-financing (CTF) expectations.",
    sections: [
      {
        heading: "Transparency by architecture",
        body: [
          "All payments, releases and refunds are executed on a public blockchain and are therefore independently auditable.",
          "Payments are addressed to a specific X handle and can only be claimed by the account proving ownership of that handle via OAuth.",
        ],
      },
      {
        heading: "Screening and controls",
        body: [
          "We may screen wallet addresses and handles against sanctions and risk lists using third-party providers.",
          "We may restrict or decline access to the service, and cooperate with lawful requests from competent authorities.",
        ],
      },
      {
        heading: "What we do not do",
        body: [
          "Tuma does not custody user funds; deposits sit in the escrow contract and are released or refunded only under the on-chain rules.",
          "Tuma is not a substitute for regulated financial institutions where licensing is required. Do not use the service where doing so would breach local law.",
        ],
      },
      {
        heading: "Reporting",
        body: [
          "If you believe Tuma is being used for illicit activity, contact us through the Support page with the relevant payment id.",
        ],
      },
    ],
  },
  {
    slug: "consumer-disclosure",
    title: "Consumer Disclosure",
    updated: "September 2026",
    intro:
      "Please read these disclosures carefully before using Tuma. They summarise the key risks of sending and receiving USDC on a public blockchain.",
    sections: [
      {
        heading: "Not insured, not a bank",
        body: [
          "Balances and escrowed funds are not bank deposits and are not insured by any deposit-insurance scheme. Tuma is non-custodial and does not hold your funds.",
        ],
      },
      {
        heading: "Irreversibility and errors",
        body: [
          "Blockchain transactions are irreversible. If you send to the wrong handle or fund the wrong address, recovery may be impossible.",
          "Only the X account matching the stored handle can claim a payment. Double-check the spelling before you send.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "If a payment is not claimed within 30 days, the original sender can refund it from the Activity page. Tuma cannot force a refund earlier than the contract allows.",
        ],
      },
      {
        heading: "Trust assumption",
        body: [
          "The claim step relies on a trusted operator wallet that releases funds after verifying your X login. A compromised operator could release a payment to the wrong address. This trade-off exists today to let recipients claim without needing a wallet setup.",
        ],
      },
      {
        heading: "Price and network risk",
        body: [
          "USDC is intended to track one US dollar but carries issuer and market risk. Local-currency figures shown in the app are live estimates and not guarantees.",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
