"use client";
import { useState } from "react";

interface Log { at: string; level: string; msg: string; }

export default function AgentTerminalPage() {
  const [logs] = useState<Log[]>([
    { at: new Date().toLocaleTimeString(), level: "info", msg: "Agent terminal ready" },
    { at: new Date().toLocaleTimeString(), level: "info", msg: "Waiting for agent activity..." },
  ]);

  return (
    <div style={{ background: "#0a0a18", borderRadius: 12, padding: 16, fontFamily: "monospace", fontSize: 13 }}>
      <div style={{ marginBottom: 8, color: "#6b6b8a" }}>Terminal Output</div>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: "#3a3a5a" }}>[{log.at}]</span>
          <span style={{ 
            color: log.level === "error" ? "#ff4466" : log.level === "warn" ? "#FFB81C" : log.level === "trade" ? "#00ff88" : "#00d4ff",
            marginLeft: 8 
          }}>
            {log.msg}
          </span>
        </div>
      ))}
    </div>
  );
}
