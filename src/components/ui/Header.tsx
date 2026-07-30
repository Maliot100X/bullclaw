"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  const isDashboard = path.startsWith("/dashboard");

  return (
    <header style={{ background: "#08080f", borderBottom: "1px solid #1e1e3a", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64, gap: 32 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #FFB81C, #00d4ff)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000" }}>B</div>
          <span style={{ fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg, #FFB81C, #ffa500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BullClaw</span>
        </Link>
        {!isDashboard && (
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/builder", label: "Agent Builder" },
              { href: "/dashboard/marketplace", label: "Marketplace" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none",
                color: path.startsWith(href) ? "#FFB81C" : "#6b6b8a",
                background: path.startsWith(href) ? "#FFB81C10" : "transparent",
              }}>{label}</Link>
            ))}
          </nav>
        )}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <Link href="/register" style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #FFB81C", color: "#FFB81C", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          <Link href="/dashboard/builder" style={{ padding: "7px 14px", borderRadius: 7, background: "linear-gradient(135deg, #FFB81C, #f0a000)", color: "#000", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>+ New Agent</Link>
        </div>
      </div>
    </header>
  );
}
