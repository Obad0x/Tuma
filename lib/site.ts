export const SITE_URL = "https://tuma-psi.vercel.app";

export const SITE_NAME = "Tuma";

export const SITE_TITLE = "Tuma — Send USDC to an X (Twitter) Handle";

export const SITE_DESCRIPTION =
  "Send USDC to anyone's X (Twitter) handle — no wallet needed for the recipient. Funds sit in an on-chain escrow on Arc and are claimed with one login. Refundable after 30 days.";

export const SITE_SHORT_DESCRIPTION =
  "Send USDC to someone's X (Twitter) handle. They claim it with one login — escrowed on-chain.";

export const SITE_KEYWORDS = [
  "send USDC to X handle",
  "send USDC to Twitter handle",
  "send crypto to Twitter",
  "send USDC without a wallet",
  "claim USDC with X login",
  "crypto escrow",
  "USDC escrow",
  "stablecoin transfer",
  "Arc blockchain",
  "USDC on Arc",
  "send money to Nigeria with USDC",
  "USDC to NGN",
];

export const SITE_LOCALE = "en_US";

export const SITE_TWITTER = "@tuma";

export const SITE_CATEGORY = "technology";

// Google Search Console verification token (HTML tag method).
export const SITE_GOOGLE_VERIFICATION = "RLgoK3pO2St50lV-LKBpowylrNu9caWzx4nAVgYt9Vs";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
