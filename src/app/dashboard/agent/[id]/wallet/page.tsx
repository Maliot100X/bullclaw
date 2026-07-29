"use client";
import { useState } from "react";


interface Holding { symbol: string; amount: number; valueUsd: number; }

export default function AgentWalletPage() {
  
  const [holdings] = useState<Holding[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 12 }}>Token Holdings</h3>
        {holdings.length === 0 ? (
          <p style={{ color: "#6b6b8a", fontSize: 14 }}>No holdings yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {holdings.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e1e3a20" }}>
                <span style={{ color: "#e8e8f0" }}>{h.symbol}</span>
                <span style={{ color: "#6b6b8a" }}>{h.amount.toLocaleString()}</span>
                <span style={{ color: "#00ff88" }}>${h.valueUsd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
