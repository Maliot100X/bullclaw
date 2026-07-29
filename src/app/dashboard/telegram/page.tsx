"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TelegramPage() {
  const [token, setToken] = useState("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("bullclaw_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    
    // Check for tg param
    const params = new URLSearchParams(window.location.search);
    const tg = params.get("tg");
    if (tg) {
      localStorage.setItem("bullclaw_telegram_id", tg);
    }

    fetch("/api/telegram/session", { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(r => r.json())
      .then(d => { setSession(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  async function toggleAlert(field: string, current: boolean) {
    const res = await fetch("/api/telegram/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ field, enabled: !current }),
    });
    if (res.ok) {
      setSession((s: any) => ({ ...s, [field]: !current }));
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginTop: 8 }}>Telegram</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Manage your Telegram bot notifications</p>
      </div>

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>🤖 Connect @AnsemClawBot</h2>
        <p style={{ color: "#6b6b8a", marginBottom: 16 }}>
          Open the Telegram bot and send /start to link your account.
        </p>
        <a href="https://t.me/AnsemClawBot" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 24px", background: "#0088cc", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, display: "inline-block" }}>
          Open @AnsemClawBot →
        </a>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 24 }}>🔔 Alert Settings</h2>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #1e1e3a" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e8f0" }}>Trade Alerts</div>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>Get notified when trades execute</div>
          </div>
          <button onClick={() => toggleAlert("notifyTrades", session?.notifyTrades)} style={{ padding: "8px 16px", background: session?.notifyTrades ? "#00ff8820" : "#ff446620", color: session?.notifyTrades ? "#00ff88" : "#ff4466", border: `1px solid ${session?.notifyTrades ? "#00ff8840" : "#ff446640"}`, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {session?.notifyTrades ? "ON" : "OFF"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #1e1e3a" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e8f0" }}>Daily P&L</div>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>Daily profit/loss summary</div>
          </div>
          <button onClick={() => toggleAlert("notifyPnL", session?.notifyPnL)} style={{ padding: "8px 16px", background: session?.notifyPnL ? "#00ff8820" : "#ff446620", color: session?.notifyPnL ? "#00ff88" : "#ff4466", border: `1px solid ${session?.notifyPnL ? "#00ff8840" : "#ff446640"}`, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {session?.notifyPnL ? "ON" : "OFF"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #1e1e3a" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e8f0" }}>Risk Alerts</div>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>Position liquidation warnings</div>
          </div>
          <button onClick={() => toggleAlert("notifyRisk", session?.notifyRisk)} style={{ padding: "8px 16px", background: session?.notifyRisk ? "#00ff8820" : "#ff446620", color: session?.notifyRisk ? "#00ff88" : "#ff4466", border: `1px solid ${session?.notifyRisk ? "#00ff8840" : "#ff446640"}`, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {session?.notifyRisk ? "ON" : "OFF"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e8f0" }}>New Launches</div>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>Token launch notifications</div>
          </div>
          <button onClick={() => toggleAlert("notifyLaunches", session?.notifyLaunches)} style={{ padding: "8px 16px", background: session?.notifyLaunches ? "#00ff8820" : "#ff446620", color: session?.notifyLaunches ? "#00ff88" : "#ff4466", border: `1px solid ${session?.notifyLaunches ? "#00ff8840" : "#ff446640"}`, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {session?.notifyLaunches ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 32, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>📱 Bot Commands</h2>
        <div style={{ fontFamily: "monospace", background: "#0a0a18", padding: 16, borderRadius: 8 }}>
          <p style={{ color: "#6b6b8a", marginBottom: 8 }}>/start - Link your account</p>
          <p style={{ color: "#6b6b8a", marginBottom: 8 }}>/agents - View your agents</p>
          <p style={{ color: "#6b6b8a", marginBottom: 8 }}>/balance - Portfolio overview</p>
          <p style={{ color: "#6b6b8a", marginBottom: 8 }}>/trades - Recent trades</p>
          <p style={{ color: "#6b6b8a" }}>/alerts - Manage notifications</p>
        </div>
      </div>
    </div>
  );
}
