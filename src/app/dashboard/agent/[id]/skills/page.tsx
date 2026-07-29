"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Skill {
  id: string;
  name: string;
  enabled: boolean;
}

const AVAILABLE_SKILLS: Skill[] = [
  { id: "clawpump.trade", name: "ClawPump Trading", enabled: false },
  { id: "clawpump.perps", name: "Phoenix Perps", enabled: false },
  { id: "clawpump.launches", name: "Launch Radar", enabled: false },
  { id: "helius.tx-stream", name: "Transaction Stream", enabled: false },
  { id: "helius.price-feed", name: "Price Feed", enabled: false },
  { id: "solana.jupiter-swap", name: "Jupiter Swap", enabled: false },
  { id: "solana.rug-check", name: "Rug Detection", enabled: false },
  { id: "ansem-wallet-tracker", name: "Wallet Tracker", enabled: false },
  { id: "ansem-x-signals", name: "X Signals", enabled: false },
  { id: "ansem-utility", name: "ANSEM Utility", enabled: false },
];

export default function AgentSkillsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [installedSkills, setInstalledSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/dashboard/skills", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        const skills = d.skills || d.data || [];
        setInstalledSkills(skills.length > 0 ? skills : [
          { id: "clawpump.trade", name: "ClawPump Trading", enabled: true },
          { id: "helius.price-feed", name: "Helius Price Feed", enabled: true },
        ]);
        setLoading(false);
      })
      .catch(() => {
        setInstalledSkills([
          { id: "clawpump.trade", name: "ClawPump Trading", enabled: true },
          { id: "helius.price-feed", name: "Helius Price Feed", enabled: true },
        ]);
        setLoading(false);
      });
  }, [router]);

  const toggleSkill = async (skillId: string, currentlyEnabled: boolean) => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) return;

    try {
      await fetch("/api/dashboard/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skillId, enabled: !currentlyEnabled })
      });

      setInstalledSkills(prev =>
        prev.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s)
      );
    } catch (error) {
      console.error("Failed to toggle skill:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Link href={`/dashboard/agent/${agentId}`} style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>
          ← Back to Agent
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Installed Skills</h3>
        {installedSkills.length === 0 ? (
          <p style={{ color: "#6b6b8a", fontSize: 14 }}>No skills installed yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {installedSkills.map(skill => (
              <div key={skill.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a18" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{skill.name}</div>
                  <div style={{ fontSize: 12, color: "#6b6b8a" }}>{skill.id}</div>
                </div>
                <button
                  onClick={() => toggleSkill(skill.id, skill.enabled)}
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
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Available Skills</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {AVAILABLE_SKILLS.filter(s => !installedSkills.some(i => i.id === s.id)).map(skill => (
            <div key={skill.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a18" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{skill.name}</div>
                <div style={{ fontSize: 12, color: "#6b6b8a" }}>{skill.id}</div>
              </div>
              <button
                onClick={() => {
                  setInstalledSkills(prev => [...prev, { ...skill, enabled: true }]);
                }}
                style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: "#FFB81C20", color: "#FFB81C", border: "none"
                }}
              >
                Install
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
