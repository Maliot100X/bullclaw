'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEMPLATES = [
  { id: 'ansem-trader', name: 'Ansem Trader', description: 'Trade $ANSEM with advanced strategies' },
  { id: 'perps-sniper', name: 'Perps Sniper', description: 'Phoenix perpetuals trader' },
  { id: 'memecoin-launcher', name: 'Memecoin Launcher', description: 'Launch tokens on Pump.fun' },
  { id: 'portfolio-manager', name: 'Portfolio Manager', description: 'Multi-asset portfolio management' },
];

export default function AgentBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('');
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-6');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    if (!name || !persona || !template) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('sessionToken');
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          persona,
          model,
          template,
          skills: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/agent/${data.agent.id}`);
      } else {
        alert('Failed to create agent');
      }
    } catch (error) {
      alert('Error creating agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Create Your Agent</h1>

      {step === 1 ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Select Template</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTemplate(t.id);
                  setStep(2);
                }}
                className={`p-6 rounded-lg border-2 transition text-left ${
                  template === t.id
                    ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <h3 className="font-bold text-white">{t.name}</h3>
                <p className="text-sm text-gray-400">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-white font-bold mb-2">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-500 outline-none"
              placeholder="My Trading Bot"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Persona</label>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-500 outline-none h-24"
              placeholder="Describe your agent's personality and trading style..."
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-500 outline-none"
            >
              <option value="claude-sonnet-4-6">Claude Sonnet (Recommended)</option>
              <option value="claude-opus-4-8">Claude Opus (Powerful)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku (Fast)</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {loading ? 'Deploying...' : 'Deploy Agent'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
