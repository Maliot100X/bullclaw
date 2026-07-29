"use client";
import { useState } from "react";

export default function AgentMarketplacePage() {
  const [price, setPrice] = useState("");
  const [listed, setListed] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>List on Marketplace</h3>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginBottom: 16 }}>
          List this agent for sale on the BullClaw marketplace. You'll receive SOL when someone buys it.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            placeholder="Price in SOL"
            style={{ width: 200 }}
          />
          <button onClick={() => setListed(true)} className="btn-primary">List Agent</button>
        </div>
      </div>
      {listed && (
        <div className="card" style={{ padding: 24, borderColor: "#00ff8840" }}>
          <p style={{ color: "#00ff88", fontSize: 14 }}>✓ Agent listed for {price} SOL</p>
        </div>
      )}
    </div>
  );
}
