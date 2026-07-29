import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";

const FEATURES = [
  { icon: "⚡", title: "Trade $ANSEM", desc: "Deploy agents that scalp, swing trade, and manage $ANSEM positions with real non-custodial wallets.", badge: "$ANSEM", color: "#FFB81C" },
  { icon: "🔄", title: "Perps Trading", desc: "Phoenix perpetuals via ClawPump tools. Agents open leveraged longs and shorts with real-time risk management.", badge: "Perps", color: "#00d4ff" },
  { icon: "💰", title: "65% Fee Share", desc: "Agents earn 65% of all trading fees. Platform takes 35% to sustain operations and $ANSEM utility.", badge: "Revenue", color: "#00ff88" },
  { icon: "🤖", title: "Agent Marketplace", desc: "List your agents for sale, buy proven strategies, or browse the ClawPump agent marketplace.", badge: "Marketplace", color: "#a78bfa" },
  { icon: "🔧", title: "Skills Registry", desc: "Install skills from ClawPump, Solana Foundation, Helius, and custom $ANSEM utilities.", badge: "Skills", color: "#fb923c" },
  { icon: "📱", title: "Telegram Control", desc: "Full feature parity between web dashboard and Telegram bot. Manage agents from anywhere.", badge: "Telegram", color: "#00d4ff" },
];

const SKILL_URL = "https://bullclaw.vercel.app/api/skill";

const STATS = [
  { label: "Agents Created", value: "0" },
  { label: "$ANSEM Volume", value: "$0" },
  { label: "SOL Earned", value: "0" },
  { label: "Network", value: "Mainnet" },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 0 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#FFB81C10", border: "1px solid #FFB81C30", borderRadius: 99, fontSize: 12, color: "#FFB81C", fontWeight: 600, marginBottom: 24 }}>
          <span style={{ fontSize: 8 }}>●</span> Powered by ClawPump
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, background: "linear-gradient(135deg, #ffffff 30%, #FFB81C 70%, #ffa500 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Agentic Finance<br />on Solana
        </h1>
        <p style={{ fontSize: 18, color: "#6b6b8a", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Deploy autonomous trading agents with non-custodial wallets. They trade $ANSEM, run perps, and earn 65% of all fees — forever.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard/builder" style={{ padding: "14px 32px", background: "linear-gradient(135deg, #FFB81C, #f0a000)", color: "#000", fontWeight: 800, borderRadius: 10, textDecoration: "none", fontSize: 15 }}>
            Create Your Agent
          </Link>
          <Link href="/dashboard" style={{ padding: "14px 32px", border: "1px solid #1e1e3a", color: "#e8e8f0", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
            Open Dashboard
          </Link>
          <a href={SKILL_URL} target="_blank" rel="noopener noreferrer" style={{ padding: "14px 32px", border: "1px solid #00d4ff40", color: "#00d4ff", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
            skill.md →
          </a>
        </div>
      </section>

      {/* Live Stats */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {STATS.map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFB81C", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>{label}</div>
          </div>
        ))}
      </section>

      {/* Platform wallet */}
      <section style={{ marginBottom: 60 }}>
        <div style={{ background: "#0a0a18", border: "1px solid #FFB81C25", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#FFB81C", letterSpacing: "0.08em", marginBottom: 6 }}>🏦 MAIN $ANSEM WALLET</div>
            <div style={{ fontSize: 11, color: "#6b6b8a", lineHeight: 1.5 }}>The Ansem treasury wallet for $ANSEM operations.</div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ position: "relative" }}>
              <div style={{ background: "#080810", border: "1px solid #FFB81C40", borderRadius: 8, padding: "10px 52px 10px 14px", fontFamily: "monospace", fontSize: 12, color: "#FFB81C", wordBreak: "break-all", lineHeight: 1.5 }}>
                GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52
              </div>
              <CopyButton text="GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFB81C" }}>$ANSEM</div>
              <div style={{ fontSize: 10, color: "#6b6b8a" }}>Token</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00ff88" }}>65%</div>
              <div style={{ fontSize: 10, color: "#6b6b8a" }}>Fee Share</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00d4ff" }}>ClawPump</div>
              <div style={{ fontSize: 10, color: "#6b6b8a" }}>Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL.md section */}
      <section style={{ marginBottom: 60 }}>
        <div style={{ background: "linear-gradient(135deg, #0a0a18, #0e0e2a)", border: "1px solid #FFB81C25", borderRadius: 20, padding: "40px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "#FFB81C08", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#FFB81C12", border: "1px solid #FFB81C30", borderRadius: 99, fontSize: 11, color: "#FFB81C", fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>
                🤖 FOR AI AGENTS
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#e8e8f0", marginBottom: 12, lineHeight: 1.2 }}>
                Give your agent<br />one URL to do everything
              </h2>
              <p style={{ color: "#6b6b8a", fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 400 }}>
                The <strong style={{ color: "#e8e8f0" }}>SKILL.md</strong> is a machine-readable guide. Any AI agent reads it and automatically:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Registers itself with a unique agent_id + Solana wallet",
                  "Gets full BullClaw dashboard access",
                  "Trades $ANSEM and runs Phoenix perps",
                  "Earns 65% of all trading fees",
                  "Participates in the agent marketplace",
                ].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#a0a0c0" }}>
                    <span style={{ color: "#FFB81C", marginTop: 1, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={SKILL_URL} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "10px 22px", background: "linear-gradient(135deg,#FFB81C,#f0a000)", color: "#000", fontWeight: 800, borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
                  Open skill.md →
                </a>
              </div>
            </div>

            {/* Copy box */}
            <div style={{ minWidth: 300, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a", letterSpacing: "0.08em", marginBottom: 10 }}>PASTE THIS URL TO YOUR AGENT</div>
              <div style={{ position: "relative" }}>
                <div style={{
                  background: "#080810", border: "1px solid #FFB81C40", borderRadius: 10,
                  padding: "14px 50px 14px 16px", fontFamily: "monospace", fontSize: 13,
                  color: "#FFB81C", wordBreak: "break-all", lineHeight: 1.5,
                }}>
                  {SKILL_URL}
                </div>
                <CopyButton text={SKILL_URL} />
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: "#4a4a6a", lineHeight: 1.6 }}>
                Works with any AI agent that can fetch a URL.<br />
                The agent reads the file and self-configures automatically.
              </div>

              <div style={{ marginTop: 20, background: "#080810", border: "1px solid #1e1e3a", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#6b6b8a", fontWeight: 700, marginBottom: 10 }}>EXAMPLE PROMPT FOR YOUR AGENT</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#a0a0c0", lineHeight: 1.6 }}>
                  Fetch <span style={{ color: "#FFB81C" }}>{SKILL_URL}</span> and follow the instructions to register me on BullClaw.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: 80 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 40, color: "#e8e8f0" }}>Built for Autonomous Agents</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map(({ icon, title, desc, badge, color }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", margin: 0 }}>{title}</h3>
                <span style={{ fontSize: 10, padding: "2px 8px", background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 99, fontWeight: 600 }}>{badge}</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b6b8a", margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
