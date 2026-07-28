'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Plus, ShoppingCart, BarChart3, Puzzle, TrendingUp, MessageSquare, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
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

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-500">BullClaw</h1>
          <p className="text-sm text-gray-400">Finance on Solana</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Connected: <span className="text-green-500">mainnet</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-black p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
