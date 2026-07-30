"use client";
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/agents', label: 'My Agents', icon: '🤖' },
  { href: '/dashboard/builder', label: 'Agent Builder', icon: '🔧' },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: '🛒' },
  { href: '/dashboard/trading', label: 'Trading', icon: '📈' },
  { href: '/dashboard/skills', label: 'Skills', icon: '⚡' },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/dashboard/telegram', label: 'Telegram', icon: '📱' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? 60 : 220;

  return (
    <div style={{ background: "#08080f", minHeight: "100vh" }}>
      <aside style={{
        position: "fixed", left: 0, top: 64, bottom: 0, width,
        background: "#08080f", borderRight: "1px solid #1e1e3a",
        overflowY: "auto", transition: "width 0.2s", zIndex: 40,
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", top: 8, right: 8, width: 28, height: 28,
            background: "#1e1e3a", border: "none", borderRadius: 6,
            color: "#6b6b8a", cursor: "pointer", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {collapsed ? '→' : '←'}
        </button>

        <nav style={{ padding: "16px 8px" }}>
          {NAV.map(({ href, label, icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                  color: active ? "#FFB81C" : "#6b6b8a",
                  background: active ? "#FFB81C10" : "transparent",
                  marginBottom: 4, transition: "all 0.15s",
                  whiteSpace: "nowrap", overflow: "hidden",
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div style={{ padding: "16px 12px", borderTop: "1px solid #1e1e3a", marginTop: 16 }}>
            <Link href="/dashboard/settings" style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 8, fontSize: 13,
              fontWeight: 500, textDecoration: "none",
              color: pathname.startsWith('/dashboard/settings') ? "#FFB81C" : "#6b6b8a",
              background: pathname.startsWith('/dashboard/settings') ? "#FFB81C10" : "transparent",
            }}>
              ⚙️ Settings
            </Link>
          </div>
        )}
      </aside>

      <div style={{ marginLeft: width, transition: "margin-left 0.2s" }}>
        <main style={{ padding: "32px 40px", maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
