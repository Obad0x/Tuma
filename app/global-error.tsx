"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff8f4",
          color: "#1d1b19",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: 56, fontWeight: 900, color: "#b52603", margin: 0 }}>500</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>
          Something broke at the worst possible time.
        </h1>
        <p style={{ maxWidth: 420, fontSize: 14, color: "#5b403a", marginTop: 8 }}>
          Even the error page is having a rough day. Give it another go.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            border: 0,
            borderRadius: 9999,
            padding: "12px 24px",
            background: "#ff5a36",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
