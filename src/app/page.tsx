import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'Real Agents',
    body: 'Non-custodial Solana wallets per agent. Every trade is signed on-chain and verifiable, never simulated.',
  },
  {
    icon: BarChart3,
    title: 'Full Dashboard',
    body: 'Positions, P&L, fee earnings and a live terminal for every agent you run — with Telegram parity.',
  },
  {
    icon: Sparkles,
    title: '$ANSEM Utility',
    body: 'Holders unlock premium skills, higher agent limits and reduced platform fees.',
  },
  {
    icon: Wallet,
    title: 'Non-Custodial',
    body: 'Keys are encrypted per user. Withdraw or revoke agent authority at any moment.',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Controls',
    body: 'Per-agent stops, position caps and rug heuristics run before capital is ever committed.',
  },
  {
    icon: MessageSquare,
    title: 'Chat to Trade',
    body: 'Talk to an agent in plain language on web or Telegram and it executes with your rules.',
  },
];

const TEMPLATES = [
  { name: 'ANSEM Trader', desc: 'Scalps $ANSEM and correlated memecoins.' },
  { name: 'Perps Sniper', desc: 'Leveraged momentum with funding-aware exits.' },
  { name: 'Memecoin Launcher', desc: 'Watches new launches, filters rugs.' },
  { name: 'Portfolio Manager', desc: 'Rebalances into SOL and stables.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-gray-800/80 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bull text-black">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-white">BullClaw</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#templates" className="transition hover:text-white">
              Templates
            </a>
            <Link href="/dashboard/marketplace" className="transition hover:text-white">
              Marketplace
            </Link>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-xs font-medium text-yellow-500">
            <Sparkles className="h-3 w-3" />
            Powered by ClawPump
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Agentic finance on{' '}
            <span className="gradient-bull bg-clip-text text-transparent">Solana</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Deploy autonomous trading agents with their own non-custodial wallets.
            They research, execute and report — you keep the keys and set the rules.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard/builder"
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Create an agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-900"
            >
              View dashboard
            </Link>
          </div>

          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-gray-800 pt-8">
            {[
              ['4', 'Agent templates'],
              ['8', 'Installable skills'],
              ['100%', 'Non-custodial'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-bold text-white">{value}</dt>
                <dd className="mt-1 text-sm text-gray-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Everything an agent needs to trade
          </h2>
          <p className="mt-3 max-w-2xl text-gray-400">
            BullClaw is the utility layer for $ANSEM — a full operating surface for
            autonomous capital on Solana.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 transition hover:border-gray-700"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-yellow-500">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t border-gray-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Start from a template
          </h2>
          <p className="mt-3 text-gray-400">
            Fork a proven strategy, then edit the persona, skills and risk limits.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {TEMPLATES.map(({ name, desc }) => (
              <Link
                key={name}
                href="/dashboard/builder"
                className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-6 transition hover:border-yellow-500/40"
              >
                <div>
                  <h3 className="font-semibold text-white">{name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-600 transition group-hover:text-yellow-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl gradient-bull p-10 text-center text-black">
            <h2 className="text-3xl font-bold">Put an agent to work</h2>
            <p className="mx-auto mt-3 max-w-lg opacity-80">
              Spin up your first agent in under a minute. No custody, no lockups.
            </p>
            <Link
              href="/dashboard/builder"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-yellow-500 transition hover:bg-gray-900"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-gray-500 sm:flex-row">
          <p>BullClaw — Agentic Finance on Solana.</p>
          <p>Powered by ClawPump. Utility layer for $ANSEM.</p>
        </div>
      </footer>
    </main>
  );
}
