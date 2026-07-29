"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  skillId: string;
  skillName: string;
  source: string;
  enabled: boolean;
  description: string;
}

const AVAILABLE_SKILLS = [
  { skillId: "clawpump.trade", name: "ClawPump Spot Trading", source: "clawpump", description: "Execute spot buys and sells through ClawPump." },
  { skillId: "clawpump.perps", name: "ClawPump Perps", source: "clawpump", description: "Open, manage and close leveraged positions." },
  { skillId: "helius.tx-stream", name: "Helius Transaction Stream", source: "helius", description: "Real-time transaction monitoring." },
  { skillId: "helius.price-feed", name: "Helius Price Feed", source: "helius", description: "Low-latency pricing for any SPL mint." },
  { skillId: "solana.jupiter-swap", name: "Jupiter Swap", source: "solana", description: "Best-route swaps via Jupiter aggregation." },
  { skillId: "solana.rug-check", name: "Rug Check", source: "solana", description: "Score a mint on rug risks." },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) { router.push("/login"); return; }
    
    fetch("/api/dashboard/skills", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSkills(d.skills || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const toggleSkill = async (skillId: string, enabled: boolean) => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) return;
    
    await fetch("/api/dashboard/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillId, enabled }),
    });
    
    setSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, enabled } : s));
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 24 }}>Skills</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {AVAILABLE_SKILLS.map(skill => {
          const userSkill = skills.find(s => s.skillId === skill.skillId);
          return (
            <div key={skill.skillId} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{skill.name}</h3>
                  <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "#FFB81C20", color: "#FFB81C" }}>{skill.source}</span>
                </div>
                <button
                  onClick={() => toggleSkill(skill.skillId, !userSkill?.enabled)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: userSkill?.enabled ? "#00ff8820" : "#1e1e3a",
                    color: userSkill?.enabled ? "#00ff88" : "#6b6b8a",
                    border: "none",
                  }}
                >
                  {userSkill?.enabled ? "ON" : "OFF"}
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#6b6b8a", lineHeight: 1.5 }}>{skill.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
