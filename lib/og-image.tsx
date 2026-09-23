import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/site";

export const alt = "Tuma — send USDC to any X (Twitter) handle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadMascot(): Promise<string> {
  try {
    const file = await readFile(join(process.cwd(), "public/images/tumi-hero.jpg"));
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    return "";
  }
}

export default async function OgImage() {
  const mascot = await loadMascot();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff8f4",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 660,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 9999,
              backgroundColor: "#f3ede9",
              color: "#5b403a",
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 36,
            }}
          >
            Escrowed on-chain · Claim with one X login
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#1d1b19",
              letterSpacing: -1,
            }}
          >
            Send USDC to any
            <span style={{ color: "#ff5a36", marginLeft: 16 }}>
              X (Twitter) handle.
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#5b403a",
              marginTop: 28,
              maxWidth: 620,
            }}
          >
            They claim it with one login. No wallet, no gas, no setup for the
            recipient.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 44,
              fontSize: 26,
              fontWeight: 700,
              color: "#b52603",
            }}
          >
            {SITE_NAME} · tuma-psi.vercel.app
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 380,
            height: 380,
            borderRadius: 48,
            backgroundImage:
              "linear-gradient(135deg, #ffdf9a 0%, #ffdad2 55%, #e4dfff 100%)",
          }}
        >
          {mascot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mascot} alt="" width={320} height={320} style={{ objectFit: "contain" }} />
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
