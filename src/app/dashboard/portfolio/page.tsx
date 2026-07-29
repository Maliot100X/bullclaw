"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Holding {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  change24h: number;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) { router.push("/login"); return; }
    
    fetch("/api/dashboard/holdings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { 
        setHoldings(d.holdings || []); 
        setTotalValue(d.totalValue || 0);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 24 }}>Portfolio</h1>
      
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 4 }}>TOTAL VALUE</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#FFB81C" }}>${totalValue.toFixed(2)}</div>
      </div>

      {holdings.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "#6b6b8a" }}>No holdings yet. Create an agent to start trading.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e3a" }}>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>ASSET</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>AMOUNT</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>VALUE</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: "#6b6b8a", fontWeight: 500, fontSize: 12 }}>24H</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} style={{ borderBottom: i < holdings.length - 1 ? "1px solid #1e1e3a20" : "none" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "#e8e8f0" }}>{h.symbol}</div>
                    <div style={{ fontSize: 12, color: "#6b6b8a" }}>{h.name}</div>
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 20px", fontFamily: "monospace", color: "#e8e8f0" }}>
                    {h.amount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 20px", fontFamily: "monospace", color: "#e8e8f0" }}>
                    ${h.valueUsd.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 20px", color: h.change24h >= 0 ? "#00ff88" : "#ff4466" }}>
                    {h.change24h >= 0 ? "+" : ""}{h.change24h.toFixed(2)}%
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
