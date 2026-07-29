"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  walletAddress: string | null;
}

export default function AgentWalletPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
          setLoading(false);
          return;
        }
        setAgent(d.agent);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentId, router]);

  const copyAddress = () => {
    if (agent?.walletAddress) {
      navigator.clipboard.writeText(agent.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <Link href={`/dashboard/agent/${agentId}`} style={{ color: "#6b6b8a", textDecoration: "none", fontSize: 13 }}>
          ← Back to Agent
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>Wallet Address</h3>
        {agent?.walletAddress ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <code style={{
              flex: 1,
              padding: "12px 16px",
              background: "#0a0a18",
              borderRadius: 8,
              color: "#00d4ff",
              fontFamily: "monospace",
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {agent.walletAddress}
            </code>
            <button
              onClick={copyAddress}
              className="btn-primary"
              style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <p style={{ color: "#6b6b8a", fontSize: 14 }}>
            No wallet assigned yet. Wallet will be created when you make your first trade.
          </p>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 12 }}>Token Holdings</h3>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>
          No token holdings yet. Holdings will appear here once the agent makes trades.
        </p>
      </div>
    </div>
  );
}
