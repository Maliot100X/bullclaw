"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ wallet: "", telegram: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.wallet.trim() && !form.telegram.trim()) {
      setError("Enter wallet or Telegram username");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("bullclaw_token", data.sessionToken);
        localStorage.setItem("bullclaw_user_id", data.user.id);
        setSuccess("Account created! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "60px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #FFB81C, #00d4ff)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#000", margin: "0 auto 16px" }}>B</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 8 }}>Create Account</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Join BullClaw - Agentic Finance on Solana</p>
      </div>
      <div className="card" style={{ padding: 32 }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ color: "#00ff88", fontSize: 16, fontWeight: 600 }}>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>SOLANA WALLET *</label>
              <input type="text" value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} className="input" placeholder="7xKXtg2CW..." style={{ width: "100%", fontFamily: "monospace" }} />
              <p style={{ fontSize: 12, color: "#3a3a5a", marginTop: 4 }}>Required for receiving earnings</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b8a", marginBottom: 8 }}>TELEGRAM USERNAME</label>
              <input type="text" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} className="input" placeholder="@username" style={{ width: "100%", fontFamily: "monospace" }} />
            </div>
            {error && <div style={{ background: "#ff446615", border: "1px solid #ff446630", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#ff8899", fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px 20px", fontSize: 16 }}>{loading ? "Creating..." : "Create Account →"}</button>
          </form>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 8 }}>Or register with</p>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
              (window as any).solana.connect().then((resp: any) => {
                const wallet = resp.publicKey.toString();
                fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wallet }),
                }).then(r => r.json()).then(data => {
                  if (data.success) {
                    localStorage.setItem("bullclaw_token", data.sessionToken);
                    localStorage.setItem("bullclaw_user_id", data.user.id);
                    setSuccess("Account created! Redirecting...");
                    setTimeout(() => router.push("/dashboard"), 1500);
                  } else {
                    setError(data.error || "Registration failed");
                  }
                });
              });
            } else {
              alert("Please install Phantom wallet");
            }
          }}
          style={{ padding: "10px 20px", background: "#AB9FF2", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
          Connect Phantom Wallet
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Already have an account? <a href="/login" style={{ color: "#FFB81C" }}>Login here</a></p>
      </div>
    </div>
  );
}
