"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  persona: string;
  model: string;
  status: string;
}

const MODELS = [
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
];

export default function AgentSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`/api/agent/${agentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setMessage({ type: "error", text: d.error });
          setLoading(false);
          return;
        }
        const agentData = d.agent;
        setAgent(agentData);
        setName(agentData.name || "");
        setPersona(agentData.persona || "");
        setModel(agentData.model || "claude-sonnet-4-6");
        setStatus(agentData.status || "active");
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load agent" });
        setLoading(false);
      });
  }, [agentId, router]);

  const handleSave = async () => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, persona, model, status })
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    }

    setSaving(false);
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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Agent Settings</h3>

        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: message.type === "success" ? "#00ff8820" : "#ff446620",
            color: message.type === "success" ? "#00ff88" : "#ff4466",
            border: `1px solid ${message.type === "success" ? "#00ff8840" : "#ff446640"}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>AGENT NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              style={{ width: "100%", maxWidth: 400 }}
              placeholder="My Trading Agent"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>PERSONA</label>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="input"
              style={{ width: "100%", maxWidth: 600, height: 100, resize: "vertical" }}
              placeholder="Describe the agent's personality and trading style..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>MODEL</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input"
              style={{ width: "100%", maxWidth: 300 }}
            >
              {MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>STATUS</label>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setStatus("active")}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: status === "active" ? "1px solid #00ff88" : "1px solid #1e1e3a",
                  background: status === "active" ? "#00ff8820" : "transparent",
                  color: status === "active" ? "#00ff88" : "#6b6b8a",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Active
              </button>
              <button
                onClick={() => setStatus("paused")}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: status === "paused" ? "1px solid #FFB81C" : "1px solid #1e1e3a",
                  background: status === "paused" ? "#FFB81C20" : "transparent",
                  color: status === "paused" ? "#FFB81C" : "#6b6b8a",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Paused
              </button>
            </div>
          </div>

          <div style={{ paddingTop: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ padding: "10px 24px" }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
