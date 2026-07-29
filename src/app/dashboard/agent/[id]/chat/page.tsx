"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Message { role: string; content: string; at: string; }

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("bullclaw_token")) {
      router.push("/login");
    }
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage, at: new Date().toLocaleTimeString() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: "agent", content: `Error: ${data.error}`, at: new Date().toLocaleTimeString() }]);
      } else {
        setMessages(prev => [...prev, { role: "agent", content: data.response || "Message received.", at: new Date().toLocaleTimeString() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Failed to send message. Please try again.", at: new Date().toLocaleTimeString() }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href={`/dashboard/agent/${agentId}`} style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>
          ← Back to Agent
        </Link>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "#0a0a18", borderRadius: 12 }}>
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
        {loading && (
          <div style={{ padding: 12, color: "#6b6b8a", fontStyle: "italic" }}>
            Agent is thinking...
          </div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: "1px solid #1e1e3a", marginTop: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
            placeholder="Type a message..."
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary">Send</button>
        </div>
      </div>
    </div>
  );
}
