'use client';

import { useEffect, useState } from 'react';
import { Settings, ShieldAlert, Trash2 } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import { Button, Card, CardHeader, DemoBanner } from '@/components/ui';

const MODELS = [
  'claude-opus-4-8',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
];

export default function AgentSettingsPage() {
  const { agent, demo, notice, loading } = useAgent();

  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [model, setModel] = useState(MODELS[1]);
  const [maxPosition, setMaxPosition] = useState('10');
  const [stopLoss, setStopLoss] = useState('4');
  const [leverage, setLeverage] = useState('3');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!agent) return;
    setName(agent.name);
    setPersona(agent.persona);
    setModel(agent.model);
  }, [agent]);

  if (loading) return <p className="text-sm text-gray-500">Loading settings…</p>;

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      {/* Profile */}
      <Card>
        <CardHeader title="Profile" icon={Settings} />
        <div className="space-y-5 p-6">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="persona"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Persona
            </label>
            <textarea
              id="persona"
              rows={5}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm leading-relaxed text-white focus:border-yellow-500/50 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              This is the system prompt the agent trades under.
            </p>
          </div>

          <div>
            <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-white">
              Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Risk limits */}
      <Card>
        <CardHeader
          title="Risk limits"
          icon={ShieldAlert}
          subtitle="Your account-level risk profile still applies as a ceiling."
        />
        <div className="grid gap-5 p-6 sm:grid-cols-3">
          {[
            {
              id: 'maxPosition',
              label: 'Max position (% of wallet)',
              value: maxPosition,
              set: setMaxPosition,
            },
            { id: 'stopLoss', label: 'Stop loss (%)', value: stopLoss, set: setStopLoss },
            { id: 'leverage', label: 'Max leverage (x)', value: leverage, set: setLeverage },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-xs text-gray-500">
                {f.label}
              </label>
              <input
                id={f.id}
                type="number"
                min="0"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-gray-800 px-6 py-4">
          <Button onClick={save}>Save changes</Button>
          {saved ? <span className="text-sm text-emerald-400">Saved.</span> : null}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/20">
        <CardHeader
          title="Danger zone"
          subtitle="Withdraw this agent's funds before deleting it. This cannot be undone."
        />
        <div className="flex flex-wrap gap-2 p-6">
          <Button variant="secondary" size="sm">
            Pause indefinitely
          </Button>
          <Button variant="danger" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="h-3 w-3" />
              Delete agent
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
