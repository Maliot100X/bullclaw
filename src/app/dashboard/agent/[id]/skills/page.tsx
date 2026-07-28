'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import { useData } from '@/lib/use-data';
import { Badge, Card, CardHeader, DemoBanner, EmptyState } from '@/components/ui';
import type { DemoSkill } from '@/lib/demo-data';

const SOURCE_TONE = {
  clawpump: 'yellow',
  helius: 'blue',
  solana: 'purple',
  custom: 'gray',
} as const;

export default function AgentSkillsPage() {
  const { agent, demo, notice, loading } = useAgent();
  const all = useData<DemoSkill[]>('/api/dashboard/skills');

  /** Which skills this agent has attached, editable locally. */
  const [attached, setAttached] = useState<string[]>([]);

  useEffect(() => {
    if (!agent) return;
    try {
      setAttached(JSON.parse(agent.skillsJson || '[]'));
    } catch {
      setAttached([]);
    }
  }, [agent]);

  if (loading) return <p className="text-sm text-gray-500">Loading skills…</p>;

  const catalogue = all.data ?? [];

  const toggle = (skillId: string) =>
    setAttached((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId],
    );

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <Card>
        <CardHeader
          title="Attached skills"
          icon={Puzzle}
          subtitle={`${attached.length} of ${catalogue.length} available skills enabled for ${agent?.name ?? 'this agent'}`}
        />

        {catalogue.length === 0 ? (
          <EmptyState
            icon={Puzzle}
            title="No skills available"
            description="Install skills from the Skills tab first."
          />
        ) : (
          <ul className="divide-y divide-gray-800/70">
            {catalogue.map((s) => {
              const on = attached.includes(s.skillId);
              return (
                <li
                  key={s.skillId}
                  className="flex items-start justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">{s.skillName}</p>
                      <Badge tone={SOURCE_TONE[s.source] ?? 'gray'}>{s.source}</Badge>
                      {s.premium ? <Badge tone="purple">premium</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">
                      {s.description}
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-gray-600">{s.skillId}</p>
                  </div>

                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${s.skillName}`}
                    onClick={() => toggle(s.skillId)}
                    className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
                      on ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        on ? 'left-[1.375rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
