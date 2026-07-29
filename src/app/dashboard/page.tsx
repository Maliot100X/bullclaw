"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AgentData {
  id: string;
  name: string;
  status: string;
  totalPnL: number;
  feeEarnings: number;
  walletAddress?: string;
  template: string;
}

interface StatsData {
  totalAgents: number;
  activeAgents: number;
  totalPnL: number;
  feeEarnings: number;
  ansemPrice: number;
  agents: AgentData[];
}

const QUICK_ACTIONS = [
  { href: "/dashboard/builder", label: "Create Agent", icon: "🤖", color: "#FFB81C" },
  { href: "/dashboard/trading", label: "View Trading", icon: "📊", color: "#00d4ff" },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: "🛒", color: "#a78bfa" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "💼", color: "#00ff88" },
];

export default function DashboardHome() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setLoading(false);
          return;
        }
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#6b6b8a" }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "#6b6b8a", marginBottom: 20 }}>Session expired or invalid</p>
        <Link href="/login" style={{ color: "#FFB81C" }}>Return to Login</Link>
      </div>
    );
  }

  const agents = data.agents || [];
  const totalPnL = data.totalPnL ?? 0;
  const feeEarnings = data.feeEarnings ?? 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Manage your BullClaw agents</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#FFB81C", marginBottom: 4 }}>{data.totalAgents}</div>
          <div style={{ fontSize: 13, color: "#6b6b8a" }}>Total Agents</div>
        </div>
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#00ff88", marginBottom: 4 }}>{data.activeAgents}</div>
          <div style={{ fontSize: 13, color: "#6b6b8a" }}>Active</div>
        </div>
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: totalPnL >= 0 ? "#00ff88" : "#ff4466", marginBottom: 4 }}>
            {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} SOL
          </div>
          <div style={{ fontSize: 13, color: "#6b6b8a" }}>Total P&L</div>
        </div>
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#00d4ff", marginBottom: 4 }}>
            {feeEarnings.toFixed(4)} SOL
          </div>
          <div style={{ fontSize: 13, color: "#6b6b8a" }}>Fee Earnings</div>
        </div>
      </div>

      <div style={{ background: "#0a0a18", border: "1px solid #FFB81C25", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FFB81C", letterSpacing: "0.08em", marginBottom: 6 }}>$ANSEM PRICE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FFB81C" }}>${data.ansemPrice?.toFixed(6) || "0.000337"}</div>
        </div>
        <div style={{ height: 40, width: 1, background: "#1e1e3a" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#00ff88", marginBottom: 4 }}>AGENTS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#00ff88" }}>{data.totalAgents}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/dashboard/settings" style={{ padding: "8px 16px", background: "#FFB81C20", border: "1px solid #FFB81C40", color: "#FFB81C", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Settings →
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0" }}>Your Agents</h2>
          <Link href="/dashboard/builder" style={{ fontSize: 13, color: "#FFB81C", textDecoration: "none", fontWeight: 600 }}>
            + Create New →
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 8 }}>No agents yet</h3>
            <p style={{ color: "#6b6b8a", marginBottom: 20 }}>Create your first BullClaw agent</p>
            <Link href="/dashboard/builder" style={{ padding: "10px 20px", background: "linear-gradient(135deg, #FFB81C, #f0a000)", color: "#000", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              Create Agent
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {agents.map((agent) => (
              <Link key={agent.id} href={`/dashboard/agent/${agent.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: 20, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{agent.name}</h3>
                      <span className="badge" style={{ fontSize: 10, padding: "2px 8px", background: agent.status === "active" ? "#00ff8820" : "#ff446620", color: agent.status === "active" ? "#00ff88" : "#ff4466", border: `1px solid ${agent.status === "active" ? "#00ff8840" : "#ff446640"}`, borderRadius: 99 }}>{agent.status}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: agent.totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
                      {agent.totalPnL >= 0 ? "+" : ""}{agent.totalPnL.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6b8a" }}>
                    {agent.template} · {agent.walletAddress ? `${agent.walletAddress.slice(0, 6)}...` : "No wallet"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {QUICK_ACTIONS.map(({ href, label, icon, color }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 20, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
