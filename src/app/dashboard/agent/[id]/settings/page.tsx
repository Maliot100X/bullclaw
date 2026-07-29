"use client";
import { useState } from "react";

export default function AgentSettingsPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Agent Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>MAX POSITION SIZE (%)</label>
            <input type="number" defaultValue={10} className="input" style={{ width: 200 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>STOP LOSS (%)</label>
            <input type="number" defaultValue={5} className="input" style={{ width: 200 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>TAKE PROFIT (%)</label>
            <input type="number" defaultValue={15} className="input" style={{ width: 200 }} />
          </div>
          <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1000); }} className="btn-primary" style={{ width: 200 }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
