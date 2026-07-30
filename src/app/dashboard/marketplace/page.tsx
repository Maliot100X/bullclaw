"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  name: string;
  template: string;
  seller: string;
  priceSol: number;
  pnl30d: number;
  winRate: number;
  subscribers: number;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("bullclaw_token");
    if (!token) { router.push("/login"); return; }
    
    fetch("/api/dashboard/listings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setListings(d.listings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8f0", marginBottom: 24 }}>Marketplace</h1>
      
      <div style={{ background: "#0a0a18", border: "1px solid #FFB81C25", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>
          Browse and buy proven trading agents from other traders.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "#6b6b8a" }}>No listings yet. Be the first to sell an agent!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {listings.map(listing => (
            <div key={listing.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>{listing.name}</h3>
                  <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "#a78bfa20", color: "#a78bfa" }}>{listing.template}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FFB81C" }}>{listing.priceSol} SOL</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a" }}>30D P&L</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: listing.pnl30d >= 0 ? "#00ff88" : "#ff4466" }}>
                    {listing.pnl30d >= 0 ? "+" : ""}{listing.pnl30d.toFixed(0)} SOL
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a" }}>Win Rate</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{(listing.winRate * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a" }}>Subscribers</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{listing.subscribers}</div>
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: "100%", marginTop: 16, padding: "10px 20px" }}
                onClick={() => alert("Buy functionality requires ClawPump wallet connection. Connect in Settings first.")}
              >
                Buy Agent
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
