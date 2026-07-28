"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/agents', label: 'My Agents' },
  { href: '/dashboard/builder', label: 'Agent Builder' },
  { href: '/dashboard/marketplace', label: 'Marketplace' },
  { href: '/dashboard/trading', label: 'Trading' },
  { href: '/dashboard/skills', label: 'Skills' },
  { href: '/dashboard/portfolio', label: 'Portfolio' },
  { href: '/dashboard/telegram', label: 'Telegram' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ background: "#08080f", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ position: "fixed", left: 0, top: 64, bottom: 0, width: 220, background: "#08080f", borderRight: "1px solid #1e1e3a", overflowY: "auto" }}>
        <nav style={{ padding: "16px 12px" }}>
          {NAV.map(({ href, label }) => {
            const active = href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#FFB81C" : "#6b6b8a",
                  background: active ? "#FFB81C10" : "transparent",
                  marginBottom: 4,
                  transition: "all 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: "16px 12px", borderTop: "1px solid #1e1e3a", marginTop: 16 }}>
          <Link
            href="/dashboard/settings"
            style={{
              display: "block",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              color: pathname.startsWith('/dashboard/settings') ? "#FFB81C" : "#6b6b8a",
              background: pathname.startsWith('/dashboard/settings') ? "#FFB81C10" : "transparent",
              marginBottom: 4,
            }}
          >
            ⚙️ Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 220 }}>
        <main style={{ padding: "32px 40px", maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
