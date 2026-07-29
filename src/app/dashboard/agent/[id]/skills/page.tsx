"use client";
import { useState } from "react";

const AGENT_SKILLS = [
  { id: "clawpump.trade", name: "ClawPump Trading", enabled: true },
  { id: "helius.price-feed", name: "Helius Price Feed", enabled: true },
  { id: "solana.jupiter-swap", name: "Jupiter Swap", enabled: false },
];

export default function AgentSkillsPage() {
  const [skills, setSkills] = useState(AGENT_SKILLS);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {skills.map(skill => (
        <div key={skill.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{skill.name}</div>
            <div style={{ fontSize: 12, color: "#6b6b8a" }}>{skill.id}</div>
          </div>
          <button
            onClick={() => setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, enabled: !s.enabled } : s))}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: skill.enabled ? "#00ff8820" : "#1e1e3a",
              color: skill.enabled ? "#00ff88" : "#6b6b8a", border: "none"
            }}
          >
            {skill.enabled ? "ON" : "OFF"}
          </button>
        </div>
      ))}
    </div>
  );
}
