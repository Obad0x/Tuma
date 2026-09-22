"use client";

import { useEffect, useRef, useState } from "react";

type Downloadable = { download: (options: { name: string; extension: string }) => void };

/// Personalized, brand-styled QR code (Tuma colors + logo), downloadable.
export function QrCard({ value, name }: { value: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<Downloadable | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !containerRef.current) return;
      const QR = mod.default;
      const qr = new QR({
        width: 220,
        height: 220,
        data: value,
        margin: 6,
        image: "/images/tuma-logo.jpg",
        dotsOptions: { color: "#b52603", type: "rounded" },
        backgroundOptions: { color: "#fff8f4" },
        cornersSquareOptions: { color: "#ff5a36", type: "extra-rounded" },
        cornersDotOptions: { color: "#ff5a36" },
        imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.32 },
      });
      containerRef.current.innerHTML = "";
      qr.append(containerRef.current);
      qrRef.current = qr as unknown as Downloadable;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-surface-container bg-[#fff8f4]"
      />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => qrRef.current?.download({ name, extension: "png" })}
          disabled={!ready}
          className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary disabled:opacity-50"
        >
          Download PNG
        </button>
        <button
          onClick={() => qrRef.current?.download({ name, extension: "svg" })}
          disabled={!ready}
          className="rounded-full border border-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container disabled:opacity-50"
        >
          SVG
        </button>
        <button
          onClick={copy}
          className="rounded-full border border-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
