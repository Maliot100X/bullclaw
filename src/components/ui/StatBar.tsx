interface StatBarProps {
  stats?: {
    agents?: number;
    totalPnL?: number;
    feeEarnings?: number;
    ansemPrice?: string;
  };
}

export default function StatBar({ stats = {} }: StatBarProps) {
  const { agents = 0, totalPnL = 0, feeEarnings = 0, ansemPrice = "$0.000" } = stats;
  return (
    <div style={{ borderTop: "1px solid #1e1e3a", background: "#08080f", padding: "10px 24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <span className="stat-pill"><span style={{ color: "#FFB81C" }}>●</span> {agents} agents</span>
        <span className="stat-pill">P&L: {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} SOL</span>
        <span className="stat-pill">Fees: {feeEarnings.toFixed(2)} SOL</span>
        <span className="stat-pill">$ANSEM: {ansemPrice}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#3a3a5a" }}>Powered by Solana · ClawPump · $ANSEM</span>
      </div>
    </div>
  );
}
