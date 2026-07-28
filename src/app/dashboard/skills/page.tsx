'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle, Search, Sparkles } from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Badge,
  Card,
  DemoBanner,
  EmptyState,
  PageHeader,
  StatCard,
  fmtNum,
} from '@/components/ui';
import type { DemoSkill } from '@/lib/demo-data';

const SOURCE_TONE = {
  clawpump: 'yellow',
  helius: 'blue',
  solana: 'purple',
  custom: 'gray',
} as const;

export default function SkillsPage() {
  const { data, demo, notice, loading, error } =
    useData<DemoSkill[]>('/api/dashboard/skills');

  /** Toggle state is local until a write endpoint exists. */
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (!data) return;
    setEnabled(Object.fromEntries(data.map((s) => [s.skillId, s.enabled])));
  }, [data]);

  const skills = data ?? [];

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(skills.map((s) => s.category)))],
    [skills],
  );

  const visible = useMemo(
    () =>
      skills.filter((s) => {
        if (category !== 'All' && s.category !== category) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          s.skillName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.skillId.toLowerCase().includes(q)
        );
      }),
    [skills, category, query],
  );

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <PageHeader
        title="Skills"
        description="Capabilities your agents can call. Toggle one off to revoke it everywhere."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Puzzle}
          label="Installed"
          value={skills.length}
          accent="text-blue-400"
        />
        <StatCard
          icon={Sparkles}
          label="Enabled"
          value={activeCount}
          accent="text-emerald-400"
        />
        <StatCard
          icon={Sparkles}
          label="Premium"
          value={skills.filter((s) => s.premium).length}
          accent="text-violet-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-gray-800 bg-gray-900/60 p-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                category === c ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills…"
            className="w-full rounded-lg border border-gray-800 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading skills…</p>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">Failed to load skills: {error}</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Puzzle}
            title="No skills match"
            description="Try another category or search term."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((s) => {
            const on = enabled[s.skillId] ?? s.enabled;
            return (
              <Card key={s.skillId} className="p-5 transition hover:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{s.skillName}</h3>
                      <Badge tone={SOURCE_TONE[s.source] ?? 'gray'}>{s.source}</Badge>
                      {s.premium ? <Badge tone="purple">premium</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {s.description}
                    </p>
                    <p className="mt-3 font-mono text-xs text-gray-600">{s.skillId}</p>
                  </div>

                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${s.skillName}`}
                    onClick={() =>
                      setEnabled((prev) => ({ ...prev, [s.skillId]: !on }))
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      on ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        on ? 'left-[1.375rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                  <span className="text-gray-500">
                    {fmtNum(s.installs)} installs
                  </span>
                  <span className={on ? 'text-emerald-400' : 'text-gray-500'}>
                    {on ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
