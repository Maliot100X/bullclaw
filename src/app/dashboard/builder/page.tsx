"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TEMPLATES = [
  { id: "ansem-trader", name: "ANSEM Trader", description: "Trade $ANSEM with advanced strategies", icon: "📈" },
  { id: "perps-sniper", name: "Perps Sniper", description: "Phoenix perpetuals trader", icon: "🎯" },
  { id: "memecoin-launcher", name: "Memecoin Launcher", description: "Launch tokens on Pump.fun", icon: "🚀" },
  { id: "portfolio-manager", name: "Portfolio Manager", description: "Multi-asset portfolio management", icon: "💼" },
];

export default function AgentBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("");
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) router.push("/login");
  }, [router]);

  const handleDeploy = async () => {
    if (!name || !persona || !template) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem("bullclaw_token");
      const res = await fetch("/api/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, persona, model, template, skills: [] }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/agent/${data.agent.id}`);
      } else {
        alert("Failed to create agent. Please try again.");
      }
    } catch {
      alert("Error creating agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 24 }}>Create Your Agent</h1>

      {step === 1 ? (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Select Template</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTemplate(t.id); setStep(2); }}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: template === t.id ? "2px solid #FFB81C" : "1px solid #1e1e3a",
                  background: template === t.id ? "#FFB81C10" : "#0a0a18",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: "#6b6b8a" }}>{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>AGENT NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="My Trading Bot"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>PERSONA</label>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="input"
              placeholder="Describe your agent's personality and trading style..."
              style={{ width: "100%", height: 100, resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>MODEL</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            >
              <option value="claude-sonnet-4-6">Claude Sonnet (Recommended)</option>
              <option value="claude-opus-4-8">Claude Opus (Powerful)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku (Fast)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setStep(1)}
              style={{ flex: 1, padding: "12px 20px", background: "#1e1e3a", color: "#e8e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
            >
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={loading}
              className="btn-primary"
              style={{ flex: 1, padding: "12px 20px", opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "Deploying..." : "Deploy Agent"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
