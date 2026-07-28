'use client';

import { useEffect, useState } from 'react';
import { Copy, Share2, Pause } from 'lucide-react';

export default function AgentOverviewPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch agent details from API
    setLoading(false);
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return <div className="text-gray-400">Loading agent...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Agent Info */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Agent Name</h2>
            <p className="text-gray-400">Agent persona goes here</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center space-x-2">
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded p-4">
            <span className="text-gray-400 text-sm">Total P&L</span>
            <p className="text-2xl font-bold text-white">$0.00</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <span className="text-gray-400 text-sm">Fee Earnings</span>
            <p className="text-2xl font-bold text-yellow-500">$0.00</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <span className="text-gray-400 text-sm">Status</span>
            <p className="text-2xl font-bold text-green-500">Active</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <span className="text-gray-400 text-sm">Model</span>
            <p className="text-lg font-bold text-white">Claude Sonnet</p>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Wallet Address</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value="5abc...defg"
            readOnly
            className="flex-1 bg-gray-800 text-gray-400 px-4 py-2 rounded-lg border border-gray-700"
          />
          <button
            onClick={() => copyToClipboard('5abc...defg')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-lg hover:opacity-90 transition">
          Edit Profile
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition">
          View on Solscan
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition">
          Delete Agent
        </button>
      </div>
    </div>
  );
}
