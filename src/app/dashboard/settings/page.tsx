"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, ShieldAlert, Sparkles, Wallet } from "lucide-react";

const RISK: { key: "low" | "medium" | "high"; label: string; desc: string }[] = [
  { key: "low", label: "Low", desc: "Max 2% per position, no leverage, hard 5% daily stop." },
  { key: "medium", label: "Medium", desc: "Max 10% per position, up to 3x leverage." },
  { key: "high", label: "High", desc: "Max 25% per position, up to 10x leverage." },
];

const KEYS = [
  { key: "clawpump", label: "ClawPump API key", placeholder: "cpk_xxx" },
  { key: "helius", label: "Helius API key", placeholder: "xxxxxxxx-xxxx" },
  { key: "anthropic", label: "Anthropic API key", placeholder: "sk-ant-xxx" },
  { key: "openai", label: "OpenAI API key", placeholder: "sk-xxx" },
];

interface UserData {
  wallet?: string;
  telegramId?: string;
  telegramUsername?: string;
  riskLevel: string;
  ansemHolder?: boolean;
  memberSince?: string;
  clawpumpSet?: boolean;
  heliusSet?: boolean;
  anthropicSet?: boolean;
  openaiSet?: boolean;
  ansemBenefits?: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [risk, setRisk] = useState("medium");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          router.push("/login");
          return;
        }
        setUser(d);
        setRisk(d.riskLevel || "medium");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const save = async () => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) return;

    setSaved(false);
    try {
      const body: any = { riskLevel: risk };
      if (apiKeys.clawpump) body.clawpumpKey = apiKeys.clawpump;
      if (apiKeys.helius) body.heliusKey = apiKeys.helius;
      if (apiKeys.wallet) body.wallet = apiKeys.wallet;

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaved(true);
        setApiKeys({});
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
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
        <Link href="/dashboard" style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginTop: 8 }}>Settings</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginTop: 4 }}>Account, risk profile and API credentials.</p>
      </div>

      {/* Account */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <Wallet size={20} color="#FFB81C" />
          <span style={{ fontWeight: 700, color: "#e8e8f0" }}>Account</span>
        </div>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: 24 }}>
          <div>
            <dt style={{ fontSize: 12, color: "#6b6b8a" }}>Wallet</dt>
            <dd style={{ marginTop: 4, fontFamily: "monospace", fontSize: 14, color: "#e8e8f0", wordBreak: "break-all" }}>
              {user?.wallet || "Not set"}
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: "#6b6b8a" }}>Telegram</dt>
            <dd style={{ marginTop: 4, fontSize: 14, color: "#e8e8f0" }}>
              {user?.telegramId ? `@${user.telegramId.slice(0, 10)}...` : "Not connected"}
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: "#6b6b8a" }}>$ANSEM holder</dt>
            <dd style={{ marginTop: 4 }}>
              <span style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                background: user?.ansemHolder ? "#a855f720" : "#3a3a5a20",
                color: user?.ansemHolder ? "#a855f7" : "#6b6b8a",
                border: `1px solid ${user?.ansemHolder ? "#a855f740" : "#3a3a5a40"}`
              }}>
                {user?.ansemHolder ? "verified holder" : "not a holder"}
              </span>
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: "#6b6b8a" }}>Member since</dt>
            <dd style={{ marginTop: 4, fontSize: 14, color: "#e8e8f0" }}>
              {user?.memberSince || new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Risk */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <ShieldAlert size={20} color="#FFB81C" />
          <div>
            <span style={{ fontWeight: 700, color: "#e8e8f0", display: "block" }}>Risk profile</span>
            <span style={{ fontSize: 12, color: "#6b6b8a" }}>Applies to every agent, overriding their own settings.</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 24 }}>
          {RISK.map((r) => (
            <button
              key={r.key}
              onClick={() => setRisk(r.key)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: risk === r.key ? "1px solid #FFB81C60" : "1px solid #1e1e3a",
                background: risk === r.key ? "#FFB81C08" : "transparent",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{r.label}</span>
                {risk === r.key && (
                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#FFB81C20", color: "#FFB81C" }}>active</span>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#6b6b8a", lineHeight: 1.5 }}>{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <KeyRound size={20} color="#FFB81C" />
          <div>
            <span style={{ fontWeight: 700, color: "#e8e8f0", display: "block" }}>API keys</span>
            <span style={{ fontSize: 12, color: "#6b6b8a" }}>Encrypted at rest. Values never returned to browser.</span>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {KEYS.map((k) => (
            <div key={k.key} style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "#e8e8f0", marginBottom: 8 }}>
                {k.label}
                <span style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  background: user?.[`${k.key}Set` as keyof UserData] ? "#00ff8820" : "#3a3a5a20",
                  color: user?.[`${k.key}Set` as keyof UserData] ? "#00ff88" : "#6b6b8a",
                }}>
                  {user?.[`${k.key}Set` as keyof UserData] ? "set" : "not set"}
                </span>
              </label>
              <input
                type="password"
                autoComplete="off"
                value={apiKeys[k.key] || ""}
                onChange={(e) => setApiKeys((p) => ({ ...p, [k.key]: e.target.value }))}
                placeholder={user?.[`${k.key}Set` as keyof UserData] ? "•••••••• (unchanged)" : k.placeholder}
                className="input"
                style={{ fontFamily: "monospace", width: "100%" }}
              />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #1e1e3a" }}>
            <button onClick={save} className="btn-primary" style={{ padding: "10px 20px" }}>Save changes</button>
            {saved && <span style={{ color: "#00ff88", fontSize: 14 }}>Saved!</span>}
            <span style={{ fontSize: 12, color: "#6b6b8a" }}>Only typed fields are submitted.</span>
          </div>
        </div>
      </div>

      {/* $ANSEM Benefits */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 12 }}>
          <Sparkles size={20} color="#FFB81C" />
          <span style={{ fontWeight: 700, color: "#e8e8f0" }}>$ANSEM benefits</span>
        </div>
        <ul>
          {[
            ["Premium skills", user?.ansemBenefits ? "Unlocked" : "Lock with $ANSEM"],
            ["Agent limit", user?.ansemBenefits ? "25 (vs 3 free)" : "3 free"],
            ["Platform fee", user?.ansemBenefits ? "0.5% (vs 1.0%)" : "1.0%"],
            ["Priority RPC", user?.ansemBenefits ? "Enabled" : "Standard"],
          ].map(([label, value]) => (
            <li key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #1e1e3a20" }}>
              <span style={{ color: "#6b6b8a", fontSize: 14 }}>{label}</span>
              <span style={{ color: "#e8e8f0", fontSize: 14, fontWeight: 500 }}>{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
