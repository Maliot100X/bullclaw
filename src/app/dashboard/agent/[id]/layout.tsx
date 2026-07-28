'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, Terminal, Wallet, Puzzle, TrendingUp, ShoppingCart, Settings } from 'lucide-react';

export default function AgentLayout({ children, params }: { children: ReactNode; params: { id: string } }) {
  const pathname = usePathname();
  const agentId = params.id;

  const tabs = [
    { href: `/dashboard/agent/${agentId}`, label: 'Overview', icon: Home },
    { href: `/dashboard/agent/${agentId}/chat`, label: 'Chat', icon: MessageSquare },
    { href: `/dashboard/agent/${agentId}/terminal`, label: 'Terminal', icon: Terminal },
    { href: `/dashboard/agent/${agentId}/wallet`, label: 'Wallet', icon: Wallet },
    { href: `/dashboard/agent/${agentId}/skills`, label: 'Skills', icon: Puzzle },
    { href: `/dashboard/agent/${agentId}/earnings`, label: 'Earnings', icon: TrendingUp },
    { href: `/dashboard/agent/${agentId}/marketplace`, label: 'Marketplace', icon: ShoppingCart },
    { href: `/dashboard/agent/${agentId}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <div>
      {/* Agent Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Agent Profile</h1>
        <p className="text-gray-400">ID: {agentId}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto border-b border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
