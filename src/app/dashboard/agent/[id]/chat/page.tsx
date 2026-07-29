"use client";
import { useState } from "react";


interface Message { role: string; content: string; at: string; }

export default function AgentChatPage() {
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b6b8a", marginTop: 100 }}>
            <p>Start a conversation with your agent</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ 
              padding: 12, borderRadius: 12, maxWidth: "70%",
              background: m.role === "user" ? "#FFB81C20" : "#00d4ff20",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 4 }}>{m.at}</div>
              <div style={{ color: "#e8e8f0" }}>{m.content}</div>
            </div>
          ))
        )}
      </div>
      <div style={{ padding: 16, borderTop: "1px solid #1e1e3a" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
            placeholder="Type a message..."
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          />
          <button onClick={() => sendMessage()} disabled={loading} className="btn-primary">Send</button>
        </div>
      </div>
    </div>
  );

  function sendMessage() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input, at: new Date().toLocaleTimeString() }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "agent", content: "Agent responses coming soon with AI integration.", at: new Date().toLocaleTimeString() }]);
      setLoading(false);
    }, 1000);
  }
}
