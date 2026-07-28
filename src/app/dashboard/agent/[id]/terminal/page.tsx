'use client';

import { useMemo, useState } from 'react';
import { Pause, Play, Terminal } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import { Badge, Card, CardHeader, DemoBanner } from '@/components/ui';
import { demoTerminalLog } from '@/lib/demo-data';

type Level = 'all' | 'info' | 'trade' | 'warn' | 'error';

const LEVEL_STYLE = {
  info: 'text-gray-400',
  trade: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
} as const;

const LEVELS: Level[] = ['all', 'info', 'trade', 'warn', 'error'];

export default function AgentTerminalPage() {
  const { agent, demo, notice } = useAgent();
  const [level, setLevel] = useState<Level>('all');
  const [live, setLive] = useState(true);

  const lines = useMemo(
    () => demoTerminalLog.filter((l) => level === 'all' || l.level === level),
    [level],
  );

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <Card>
        <CardHeader
          title="Terminal"
          icon={Terminal}
          subtitle={`Runtime log for ${agent?.name ?? 'this agent'}`}
          action={
            <div className="flex items-center gap-3">
              <Badge tone={live ? 'green' : 'gray'}>{live ? 'streaming' : 'paused'}</Badge>
              <button
                onClick={() => setLive(!live)}
                aria-label={live ? 'Pause stream' : 'Resume stream'}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                {live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-1 border-b border-gray-800 px-6 py-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                level === l ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="max-h-[26rem] overflow-y-auto bg-gray-950 p-4 font-mono text-xs leading-relaxed">
          {lines.length === 0 ? (
            <p className="px-2 py-6 text-center text-gray-600">
              No log lines at this level.
            </p>
          ) : (
            lines.map((l, i) => (
              <div
                key={i}
                className="flex gap-3 rounded px-2 py-1 transition hover:bg-gray-900"
              >
                <span className="shrink-0 text-gray-600">{l.at}</span>
                <span
                  className={`shrink-0 uppercase ${LEVEL_STYLE[l.level]}`}
                >
                  {l.level.padEnd(5)}
                </span>
                <span className="min-w-0 break-all text-gray-300">{l.msg}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
