"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Enter your API key, wallet address, or Telegram ID");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("bullclaw_token", data.sessionToken);
        localStorage.setItem("bullclaw_user_id", data.user.id);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #FFB81C, #00d4ff)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#000", margin: "0 auto 16px" }}>B</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8e8f0", marginBottom: 8 }}>Welcome to BullClaw</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Enter your API key or wallet to access</p>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              API Key / Wallet / Telegram ID
            </label>
            <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="bc_xxx or wallet address" className="input" style={{ fontFamily: "monospace", width: "100%" }} />
          </div>
          {error && <div style={{ background: "#ff446615", border: "1px solid #ff446630", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ff8899" }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px 20px" }}>{loading ? "Connecting..." : "Access Dashboard"}</button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1e1e3a", textAlign: "center" }}>
          <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 8 }}>New to BullClaw?</p>
          <a href="/register" style={{ padding: "10px 20px", background: "transparent", border: "1px solid #FFB81C", color: "#FFB81C", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, display: "inline-block" }}>
            Create Account →
          </a>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1e3a", textAlign: "center" }}>
          <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 8 }}>Or connect via</p>
          <a href="https://t.me/AnsemClawBot" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "#0088cc", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Telegram
          </a>
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <p style={{ color: "#3a3a5a", fontSize: 12 }}>Your credentials are encrypted and stored securely.</p>
      </div>
    </div>
  );
}
