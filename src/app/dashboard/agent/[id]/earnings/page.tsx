"use client";
import { useState } from "react";

export default function AgentEarningsPage() {
  const [totalPnL] = useState(0);
  const [feeEarnings] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
    </div>
  );
}
