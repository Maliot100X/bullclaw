'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Eye } from 'lucide-react';

export default function MyAgentsPage() {
  const [agents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch agents from API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">My Agents</h1>
        <Link
          href="/dashboard/builder"
          className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
        >
          + Create Agent
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <p className="text-gray-400 mb-4">No agents yet</p>
          <Link
            href="/dashboard/builder"
            className="text-yellow-500 hover:text-yellow-400 font-bold"
          >
            Create your first agent →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent: any) => (
            <Link
              key={agent.id}
              href={`/dashboard/agent/${agent.id}`}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{agent.persona}</p>
                  <div className="flex space-x-6">
                    <div>
                      <span className="text-gray-400 text-sm">P&L</span>
                      <p className="text-white font-bold">${agent.totalPnL.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Earnings</span>
                      <p className="text-white font-bold">${agent.feeEarnings.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Wallet</span>
                      <p className="text-white font-bold text-xs">{agent.walletAddress?.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
