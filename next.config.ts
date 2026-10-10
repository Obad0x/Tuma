import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP that still allows WalletConnect (relay websockets + verify iframe) and Next.js
// inline bootstrap scripts. 'unsafe-eval' is only enabled in development.
const walletConnectHosts = [
  "https://*.walletconnect.com",
  "https://*.walletconnect.org",
  "https://*.reown.com",
  "https://*.web3modal.com",
  "https://*.web3modal.org",
  "wss://*.walletconnect.com",
  "wss://*.walletconnect.org",
];
const rpcHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_ARC_RPC ?? "").origin;
  } catch {
    return "";
  }
})();
const supabaseHost = process.env.SUPABASE_URL ?? "";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self' ${[...walletConnectHosts, rpcHost, supabaseHost].filter(Boolean).join(" ")}${isProd ? "" : " ws: http:"}`,
  "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com",
  "worker-src 'self' blob:",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
