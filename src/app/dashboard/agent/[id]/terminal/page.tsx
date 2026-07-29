"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Log { at: string; level: string; msg: string; }
interface Trade { id: string; type: string; tokenSymbol: string; inputAmount: number; executedPrice: number; pnl: number; createdAt: string; }
interface Agent { id: string; name: string; status: string; }

export default function AgentTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`/api/agent/${agentId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/dashboard/trades?agentId=${agentId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([agentData, tradesData]) => {
        const newLogs: Log[] = [];
        
        if (agentData.agent) {
          setAgent(agentData.agent);
          newLogs.push({
            at: new Date().toLocaleTimeString(),
            level: "info",
            msg: `Agent: ${agentData.agent.name} [${agentData.agent.status.toUpperCase()}]`
          });
        }

        const trades = tradesData.trades || tradesData.data || [];
        
        if (trades.length === 0) {
          newLogs.push({
            at: new Date().toLocaleTimeString(),
            level: "info",
            msg: "No trades recorded yet"
          });
        } else {
          trades.forEach((t: Trade) => {
            const type = t.type.includes("buy") ? "BUY" : "SELL";
            const color = t.type.includes("buy") ? "trade" : "error";
            newLogs.push({
              at: new Date(t.createdAt).toLocaleTimeString(),
              level: color,
              msg: `${type} ${t.tokenSymbol} | ${t.inputAmount} @ $${t.executedPrice.toFixed(6)} | P&L: ${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(4)} SOL`
            });
          });
        }

        setLogs(newLogs);
        setLoading(false);
      })
      .catch(() => {
        setLogs([{ at: new Date().toLocaleTimeString(), level: "error", msg: "Failed to load terminal data" }]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [agentId, router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Link href={`/dashboard/agent/${agentId}`} style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>
          ← Back to Agent
        </Link>
      </div>

      <div style={{ background: "#0a0a18", borderRadius: 12, padding: 16, fontFamily: "monospace", fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: "#6b6b8a", fontSize: 12 }}>Terminal Output</div>
          <button
            onClick={fetchData}
            style={{
              padding: "4px 12px",
              background: "#1e1e3a",
              border: "none",
              borderRadius: 4,
              color: "#6b6b8a",
              cursor: "pointer",
              fontSize: 11
            }}
          >
            ↻ Refresh
          </button>
        </div>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{ color: "#3a3a5a" }}>[{log.at}]</span>
            <span style={{
              color: log.level === "error" ? "#ff4466" : log.level === "warn" ? "#FFB81C" : log.level === "trade" ? "#00ff88" : "#00d4ff",
              marginLeft: 8
            }}>
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
