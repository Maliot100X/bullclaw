'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalPnL: 0,
    feeEarnings: 0,
    mainnetPrice: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalAgents: 0,
      totalPnL: 0,
      feeEarnings: 0,
      mainnetPrice: 0,
    });
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="My Agents"
          value={stats.totalAgents}
          color="text-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Total P&L"
          value={`$${stats.totalPnL.toFixed(2)}`}
          color="text-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Fee Earnings"
          value={`$${stats.feeEarnings.toFixed(2)}`}
          color="text-yellow-500"
        />
        <StatCard
          icon={Zap}
          label="$ANSEM Price"
          value={`$${stats.mainnetPrice.toFixed(4)}`}
          color="text-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2 text-gray-400">
          <p className="text-sm">No recent activity yet.</p>
          <p className="text-sm">Create your first agent to get started.</p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-8 text-black">
        <h3 className="text-2xl font-bold mb-2">Welcome to BullClaw</h3>
        <p className="mb-4 opacity-90">Agentic Finance on Solana. Powered by ClawPump. Utility layer for $ANSEM.</p>
        <button className="px-6 py-2 bg-black text-yellow-500 font-bold rounded-lg hover:bg-gray-900 transition">
          Create Your First Agent
        </button>
      </div>
    </div>
  );
}
