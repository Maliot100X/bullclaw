"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [clawpumpKey, setClawpumpKey] = useState("");
  const [heliusKey, setHeliusKey] = useState("");
  const [wallet, setWallet] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("bullclaw_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    fetch("/api/settings", { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(r => r.json())
      .then(d => {
        if (d.clawpumpKey) setClawpumpKey(d.clawpumpKey);
        if (d.heliusKey) setHeliusKey(d.heliusKey);
        if (d.wallet) setWallet(d.wallet);
      }).catch(() => {});
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clawpumpKey, heliusKey, wallet }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginTop: 8 }}>Settings</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Configure your API keys</p>
      </div>
      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 24 }}>🔑 API Keys</h2>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>CLAWPUMP API KEY</label>
            <input type="password" value={clawpumpKey} onChange={(e) => setClawpumpKey(e.target.value)} placeholder="cpk_xxx" className="input" style={{ fontFamily: "monospace" }} />
            <p style={{ fontSize: 12, color: "#3a3a5a", marginTop: 6 }}>Get from <a href="https://clawpump.tech/dashboard/api" target="_blank" rel="noopener noreferrer" style={{ color: "#FFB81C" }}>clawpump.tech</a></p>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>HELIUS API KEY</label>
            <input type="password" value={heliusKey} onChange={(e) => setHeliusKey(e.target.value)} placeholder="xxx" className="input" style={{ fontFamily: "monospace" }} />
            <p style={{ fontSize: 12, color: "#3a3a5a", marginTop: 6 }}>Get from <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" style={{ color: "#FFB81C" }}>helius.dev</a></p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>SOLANA WALLET</label>
            <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="7xKX..." className="input" style={{ fontFamily: "monospace" }} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "12px 24px" }}>{saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}</button>
      </form>
      <div className="card" style={{ padding: 32, marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>🤖 Telegram</h2>
        <p style={{ color: "#6b6b8a", marginBottom: 16 }}>Connect via <a href="https://t.me/AnsemClawBot" target="_blank" rel="noopener noreferrer" style={{ color: "#FFB81C" }}>@AnsemClawBot</a></p>
      </div>
    </div>
  );
}
