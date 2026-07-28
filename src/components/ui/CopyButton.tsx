"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      style={{
        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
        background: "#FFB81C20", border: "1px solid #FFB81C40", color: "#FFB81C",
        borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}
