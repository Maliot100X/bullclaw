"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Trade {
  id: string;
  type: string;
  tokenSymbol: string;
  inputAmount: number;
  pnl: number;
  createdAt: string;
}

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) { router.push("/login"); return; }
    
    fetch("/api/dashboard/trades", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setTrades(d.trades || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 24 }}>Trading</h1>
      
      {trades.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "#6b6b8a" }}>No trades yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e3a" }}>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>TYPE</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>TOKEN</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>AMOUNT</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>P&L</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < trades.length - 1 ? "1px solid #1e1e3a20" : "none" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      padding: "4px 8px", borderRadius: 4, fontSize: 12,
                      background: t.type.includes("buy") ? "#00ff8820" : "#ff446620",
                      color: t.type.includes("buy") ? "#00ff88" : "#ff4466",
                    }}>
                      {t.type.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 500, color: "#e8e8f0" }}>{t.tokenSymbol}</td>
                  <td style={{ textAlign: "right", padding: "16px 20px", fontFamily: "monospace", color: "#e8e8f0" }}>
                    {t.inputAmount.toFixed(4)}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 20px", color: t.pnl >= 0 ? "#00ff88" : "#ff4466" }}>
                    {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontSize: 13 }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
