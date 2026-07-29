"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  status: string;
  template: string;
  persona: string;
  model: string;
  walletAddress: string;
  totalPnL: number;
  feeEarnings: number;
}

export default function AgentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) { router.push("/login"); return; }
    
    fetch(`/api/agent/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setAgent(d.agent); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;
  if (!agent) return <div style={{ textAlign: "center", padding: 80, color: "#ff4466" }}>Agent not found</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Link href="/dashboard/agents" style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>← My Agents</Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginTop: 8 }}>{agent.name}</h1>
          <span style={{
            padding: "4px 12px", borderRadius: 99, fontSize: 12,
            background: agent.status === "active" ? "#00ff8820" : "#ff446620",
            color: agent.status === "active" ? "#00ff88" : "#ff4466",
            display: "inline-block", marginTop: 8
          }}>
            {agent.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" style={{ padding: "8px 16px" }}>
            {agent.status === "active" ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FFB81C" }}>{agent.totalPnL >= 0 ? "+" : ""}{agent.totalPnL.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: "#6b6b8a" }}>Total P&L (SOL)</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#00d4ff" }}>{agent.feeEarnings.toFixed(4)}</div>
          <div style={{ fontSize: 12, color: "#6b6b8a" }}>Fee Earnings (SOL)</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#e8e8f0" }}>{agent.template}</div>
          <div style={{ fontSize: 12, color: "#6b6b8a" }}>Template</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#e8e8f0" }}>{agent.model.split("-")[1]?.toUpperCase() || "S"}</div>
          <div style={{ fontSize: 12, color: "#6b6b8a" }}>Model</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e3a" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0" }}>Wallet</h2>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: "monospace", color: "#6b6b8a", fontSize: 14 }}>
            {agent.walletAddress || "No wallet assigned"}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e3a" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0" }}>Persona</h2>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ color: "#6b6b8a", fontSize: 14, lineHeight: 1.6 }}>
            {agent.persona || "No persona set"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {[
          { href: `/dashboard/agent/${agent.id}/chat`, label: "Chat", icon: "💬" },
          { href: `/dashboard/agent/${agent.id}/terminal`, label: "Terminal", icon: "📟" },
          { href: `/dashboard/agent/${agent.id}/wallet`, label: "Wallet", icon: "💰" },
          { href: `/dashboard/agent/${agent.id}/skills`, label: "Skills", icon: "🔧" },
          { href: `/dashboard/agent/${agent.id}/marketplace`, label: "Marketplace", icon: "🛒" },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: 16, textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{tab.icon}</div>
              <div style={{ fontSize: 12, color: "#6b6b8a" }}>{tab.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
