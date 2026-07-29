"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  status: string;
  template: string;
  totalPnL: number;
  feeEarnings: number;
}

export default function AgentEarningsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`/api/agent/${agentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setLoading(false);
          return;
        }
        setAgent(d.agent);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentId, router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>
        Loading...
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#ff4466" }}>
        Agent not found
      </div>
    );
  }

  const totalPnL = agent.totalPnL || 0;
  const feeEarnings = agent.feeEarnings || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Link href={`/dashboard/agent/${agentId}`} style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>
          ← Back to Agent
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 24 }}>Earnings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ padding: 20, background: "#0a0a18", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 8 }}>TOTAL P&L</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} SOL
            </div>
          </div>
          <div style={{ padding: 20, background: "#0a0a18", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 8 }}>FEE EARNINGS</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#00d4ff" }}>
              {feeEarnings.toFixed(4)} SOL
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Agent Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 4 }}>Status</div>
            <div style={{ 
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              display: "inline-block",
              background: agent.status === "active" ? "#00ff8820" : "#FFB81C20",
              color: agent.status === "active" ? "#00ff88" : "#FFB81C"
            }}>
              {agent.status}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 4 }}>Template</div>
            <div style={{ color: "#e8e8f0", fontWeight: 600 }}>{agent.template}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
