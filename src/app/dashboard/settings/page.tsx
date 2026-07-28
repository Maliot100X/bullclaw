'use client';

import { useState } from 'react';
import { KeyRound, ShieldAlert, Sparkles, Wallet } from 'lucide-react';
import { Badge, Button, Card, CardHeader, PageHeader } from '@/components/ui';
import { demoUser } from '@/lib/demo-data';

const RISK: { key: 'low' | 'medium' | 'high'; label: string; desc: string }[] = [
  { key: 'low', label: 'Low', desc: 'Max 2% per position, no leverage, hard 5% daily stop.' },
  { key: 'medium', label: 'Medium', desc: 'Max 10% per position, up to 3x leverage.' },
  { key: 'high', label: 'High', desc: 'Max 25% per position, up to 10x leverage.' },
];

/**
 * Keys are write-only: the API returns whether one is set, never the value,
 * so the inputs stay empty and only submit when the user types a new one.
 */
const KEYS = [
  { key: 'clawpump', label: 'ClawPump API key', placeholder: 'cpk_…', set: true },
  { key: 'helius', label: 'Helius API key', placeholder: '9a4681…', set: true },
  { key: 'anthropic', label: 'Anthropic API key', placeholder: 'sk-ant-…', set: false },
  { key: 'openai', label: 'OpenAI API key', placeholder: 'sk-…', set: false },
];

export default function SettingsPage() {
  const [risk, setRisk] = useState(demoUser.riskLevel);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account, risk profile and the credentials your agents trade with."
      />

      {/* Account */}
      <Card>
        <CardHeader title="Account" icon={Wallet} />
        <dl className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Wallet</dt>
            <dd className="mt-1 break-all font-mono text-sm text-white">
              {demoUser.wallet}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Telegram</dt>
            <dd className="mt-1 text-sm text-white">@{demoUser.telegramUsername}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">$ANSEM holder</dt>
            <dd className="mt-1">
              <Badge tone={demoUser.ansemHolder ? 'purple' : 'gray'}>
                {demoUser.ansemHolder ? 'verified holder' : 'not a holder'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Member since</dt>
            <dd className="mt-1 text-sm text-white">
              {new Date(demoUser.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Risk */}
      <Card>
        <CardHeader
          title="Risk profile"
          icon={ShieldAlert}
          subtitle="Applies as a ceiling to every agent, overriding their own settings."
        />
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {RISK.map((r) => (
            <button
              key={r.key}
              onClick={() => setRisk(r.key)}
              className={`rounded-xl border p-4 text-left transition ${
                risk === r.key
                  ? 'border-yellow-500/60 bg-yellow-500/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{r.label}</span>
                {risk === r.key ? <Badge tone="yellow">active</Badge> : null}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{r.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* API keys */}
      <Card>
        <CardHeader
          title="API keys"
          icon={KeyRound}
          subtitle="Encrypted at rest. Existing values are never returned to the browser."
        />
        <div className="space-y-5 p-6">
          {KEYS.map((k) => (
            <div key={k.key}>
              <label
                htmlFor={k.key}
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-white"
              >
                {k.label}
                {k.set ? <Badge tone="green">set</Badge> : <Badge tone="gray">not set</Badge>}
              </label>
              <input
                id={k.key}
                type="password"
                autoComplete="off"
                value={keys[k.key] ?? ''}
                onChange={(e) => setKeys((p) => ({ ...p, [k.key]: e.target.value }))}
                placeholder={k.set ? '•••••••• (unchanged)' : k.placeholder}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:outline-none"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 border-t border-gray-800 pt-5">
            <Button onClick={save}>Save changes</Button>
            {saved ? (
              <span className="text-sm text-emerald-400">Saved.</span>
            ) : (
              <span className="text-xs text-gray-500">
                Only fields you type into are submitted.
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* $ANSEM benefits */}
      <Card>
        <CardHeader title="$ANSEM benefits" icon={Sparkles} />
        <ul className="divide-y divide-gray-800/70 text-sm">
          {[
            ['Premium skills', 'Unlocked'],
            ['Agent limit', '25 (vs 3 free)'],
            ['Platform fee', '0.5% (vs 1.0%)'],
            ['Priority RPC', 'Enabled'],
          ].map(([label, value]) => (
            <li key={label} className="flex items-center justify-between px-6 py-3">
              <span className="text-gray-400">{label}</span>
              <span className="font-medium text-white">{value}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
