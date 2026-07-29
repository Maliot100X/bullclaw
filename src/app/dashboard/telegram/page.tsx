"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Bell, MessageSquare, TrendingUp, Zap } from "lucide-react";

interface TelegramData {
  connected: boolean;
  telegramId?: string;
  telegramUsername?: string;
  linkedAt?: string;
  notifyTrades: boolean;
  notifyPnL: boolean;
  notifyRisk: boolean;
  notifyLaunches: boolean;
}

export default function TelegramPage() {
  const [data, setData] = useState<TelegramData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetch("/api/telegram/session", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { 
        if (d.error) {
          setData({ connected: false, notifyTrades: true, notifyPnL: true, notifyRisk: true, notifyLaunches: false });
        } else {
          setData({ ...d, connected: !!d.telegramId });
        }
        setLoading(false);
      })
      .catch(() => {
        setData({ connected: false, notifyTrades: true, notifyPnL: true, notifyRisk: true, notifyLaunches: false });
        setLoading(false);
      });
  }, [router]);

  const toggle = async (field: keyof TelegramData) => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token || !data) return;
    
    const newValue = !data[field as keyof typeof data];
    const res = await fetch("/api/telegram/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ field, enabled: newValue }),
    });
    
    if (res.ok) {
      setData({ ...data, [field]: newValue });
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>Loading...</div>;
  }

  const COMMANDS = [
    { cmd: "/start", desc: "Link this Telegram account to BullClaw" },
    { cmd: "/agents", desc: "List your agents with status and P&L" },
    { cmd: "/balance", desc: "Aggregate portfolio value across agents" },
    { cmd: "/trades", desc: "Last 10 executions" },
    { cmd: "/alerts", desc: "Toggle notification settings" },
    { cmd: "/help", desc: "Show all commands" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Link href="/dashboard" style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginTop: 8 }}>Telegram</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginTop: 4 }}>Full feature parity with web dashboard, from your phone.</p>
      </div>

      {/* Connection */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <Bot size={20} color="#FFB81C" />
          <span style={{ fontWeight: 700, color: "#e8e8f0" }}>Connection</span>
        </div>
        <div style={{ padding: 24 }}>
          {data?.connected ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88" }} />
                  <span style={{ color: "#00ff88", fontSize: 14, fontWeight: 600 }}>connected</span>
                </div>
                <div style={{ color: "#e8e8f0", fontSize: 14 }}>@{data.telegramUsername || "User"}</div>
                <div style={{ color: "#6b6b8a", fontSize: 12, marginTop: 4 }}>Linked {data.linkedAt || "recently"}</div>
              </div>
              <button style={{ padding: "8px 16px", background: "#ff446620", color: "#ff4466", border: "1px solid #ff446640", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                Unlink
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4466" }} />
                <span style={{ color: "#ff4466", fontSize: 14, fontWeight: 600 }}>Not connected</span>
              </div>
              <p style={{ color: "#6b6b8a", fontSize: 14, marginBottom: 16 }}>
                Open the Telegram bot and send /start to link your account.
              </p>
              <a href="https://t.me/AnsemClawBot" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 24px", background: "#0088cc", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, display: "inline-block" }}>
                Open @AnsemClawBot →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <Bell size={20} color="#FFB81C" />
          <div>
            <span style={{ fontWeight: 700, color: "#e8e8f0", display: "block" }}>Alerts</span>
            <span style={{ fontSize: 12, color: "#6b6b8a" }}>What the bot pushes to you.</span>
          </div>
        </div>
        
        <div>
          {[
            { key: "notifyTrades" as const, icon: MessageSquare, label: "Trade executions", desc: "Every fill, with size and P&L." },
            { key: "notifyPnL" as const, icon: TrendingUp, label: "Daily P&L summary", desc: "One digest at 00:00 UTC." },
            { key: "notifyRisk" as const, icon: Bell, label: "Risk events", desc: "Stops hit, drawdown limits, failed routes." },
            { key: "notifyLaunches" as const, icon: Zap, label: "New launches", desc: "Only from agents running Launch Radar." },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: i < arr.length - 1 ? "1px solid #1e1e3a20" : "none" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <item.icon size={16} color="#6b6b8a" />
                  <span style={{ fontWeight: 500, color: "#e8e8f0" }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 13, color: "#6b6b8a", marginTop: 2 }}>{item.desc}</div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                style={{
                  padding: "8px 16px",
                  background: data?.[item.key] ? "#00ff8820" : "#ff446620",
                  color: data?.[item.key] ? "#00ff88" : "#ff4466",
                  border: `1px solid ${data?.[item.key] ? "#00ff8840" : "#ff446640"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {data?.[item.key] ? "ON" : "OFF"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Commands */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <MessageSquare size={20} color="#FFB81C" />
          <span style={{ fontWeight: 700, color: "#e8e8f0" }}>Commands</span>
        </div>
        <div style={{ padding: 16, background: "#0a0a18", borderRadius: 8, margin: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e3a" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#6b6b8a", fontWeight: 500 }}>Command</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#6b6b8a", fontWeight: 500 }}>Does</th>
              </tr>
            </thead>
            <tbody>
              {COMMANDS.map((c) => (
                <tr key={c.cmd} style={{ borderBottom: "1px solid #1e1e3a20" }}>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#FFB81C" }}>{c.cmd}</td>
                  <td style={{ padding: "8px 12px", color: "#e8e8f0" }}>{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
