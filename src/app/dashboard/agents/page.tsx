"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  status: string;
  template: string;
  totalPnL: number;
  feeEarnings: number;
  walletAddress?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/dashboard/agents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setAgents(d.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0" }}>My Agents</h1>
          <p style={{ color: "#6b6b8a", fontSize: 14 }}>{agents.length} agent{agents.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/builder" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none" }}>
          + Create Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h3 style={{ fontSize: 18, color: "#e8e8f0", marginBottom: 8 }}>No agents yet</h3>
          <p style={{ color: "#6b6b8a", marginBottom: 20 }}>Create your first BullClaw agent to start trading.</p>
          <Link href="/dashboard/builder" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none" }}>
            Create Agent
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {agents.map(agent => (
            <Link key={agent.id} href={`/dashboard/agent/${agent.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 20, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{agent.name}</h3>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 11,
                      background: agent.status === "active" ? "#00ff8820" : agent.status === "paused" ? "#FFB81C20" : "#ff446620",
                      color: agent.status === "active" ? "#00ff88" : agent.status === "paused" ? "#FFB81C" : "#ff4466",
                    }}>
                      {agent.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: agent.totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
                    {agent.totalPnL >= 0 ? "+" : ""}{agent.totalPnL.toFixed(2)} SOL
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b6b8a" }}>
                  {agent.template} • {agent.walletAddress ? `${agent.walletAddress.slice(0, 6)}...` : "No wallet"}
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: "#6b6b8a" }}>
                  Fees: {agent.feeEarnings.toFixed(4)} SOL
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
