'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Home,
  MessageSquare,
  Plus,
  Puzzle,
  Settings,
  ShoppingCart,
  TrendingUp,
  Zap,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/agents', label: 'My Agents', icon: Zap },
  { href: '/dashboard/builder', label: 'Agent Builder', icon: Plus },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { href: '/dashboard/trading', label: 'Trading', icon: TrendingUp },
  { href: '/dashboard/skills', label: 'Skills', icon: Puzzle },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: BarChart3 },
  { href: '/dashboard/telegram', label: 'Telegram', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

/** Derives the topbar heading from the current route. */
function useTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/agent/')) return 'Agent';
  const match = NAV.find(
    (n) => n.href !== '/dashboard' && pathname.startsWith(n.href),
  );
  return match ? match.label : 'Overview';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = useTitle(pathname);

  return (
    <div className="flex h-screen bg-black">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-800 bg-gray-950 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-gray-800 px-6 py-5 transition hover:bg-gray-900/50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bull text-black">
            <Zap className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-bold leading-tight text-white">BullClaw</span>
            <span className="block text-xs text-gray-500">Finance on Solana</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <div className="mb-3 rounded-lg bg-gray-900 px-3 py-2.5">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-white">GV6U…VdC52</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
              $ANSEM holder
            </span>
          </div>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-400 transition hover:bg-gray-900 hover:text-white"
          >
            Disconnect
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-4">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden items-center gap-2 text-gray-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              mainnet
            </span>
            <Link
              href="/dashboard/builder"
              className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-yellow-400"
            >
              New agent
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
