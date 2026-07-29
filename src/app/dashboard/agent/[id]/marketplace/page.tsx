"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  listedForSale: boolean;
  salePrice: number | null;
}

export default function AgentMarketplacePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        const agentData = d.agent;
        setAgent(agentData);
        setPrice(agentData.salePrice ? String(agentData.salePrice) : "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentId, router]);

  const listAgent = async () => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token || !price) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ listedForSale: true, salePrice: parseFloat(price) })
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `Agent listed for ${price} SOL!` });
        setAgent({ ...agent!, listedForSale: true, salePrice: parseFloat(price) });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to list agent" });
    }

    setSaving(false);
  };

  const delistAgent = async () => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ listedForSale: false, salePrice: null })
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Agent removed from marketplace" });
        setAgent({ ...agent!, listedForSale: false, salePrice: null });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delist agent" });
    }

    setSaving(false);
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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>List on Marketplace</h3>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginBottom: 16 }}>
          List this agent for sale on the BullClaw marketplace. You'll receive SOL when someone buys it.
        </p>

        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: message.type === "success" ? "#00ff8820" : "#ff446620",
            color: message.type === "success" ? "#00ff88" : "#ff4466",
          }}>
            {message.text}
          </div>
        )}

        {agent?.listedForSale ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 16, background: "#00ff8820", borderRadius: 8 }}>
              <div style={{ color: "#00ff88", fontWeight: 600, marginBottom: 4 }}>✓ Listed for Sale</div>
              <div style={{ color: "#00ff88", fontSize: 24, fontWeight: 900 }}>{agent.salePrice} SOL</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <a
                href={`/dashboard/marketplace?agent=${agentId}`}
                target="_blank"
                style={{
                  padding: "10px 20px",
                  background: "#FFB81C",
                  color: "#000",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                View on Marketplace →
              </a>
              <button onClick={delistAgent} disabled={saving} className="btn-primary" style={{ background: "#ff4466" }}>
                {saving ? "Removing..." : "Remove Listing"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="Price in SOL"
              style={{ width: 200 }}
            />
            <button onClick={listAgent} disabled={saving || !price} className="btn-primary">
              {saving ? "Listing..." : "List Agent"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
