'use client';

/**
 * Shared presentational primitives.
 *
 * The dashboard pages were each hand-rolling the same panel/badge markup with
 * slightly different greys, so they are centralised here.
 */

import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-gray-800 px-6 py-4">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-yellow-500">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  accent = 'text-yellow-500',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: number;
  accent?: string;
}) {
  return (
    <Card className="p-5 transition hover:border-gray-700">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
      {delta !== undefined ? (
        <div
          className={`mt-1 text-xs font-medium ${
            delta >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}% 24h
        </div>
      ) : null}
    </Card>
  );
}

type Tone = 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'blue';

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  red: 'bg-red-500/10 text-red-400 ring-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20',
  gray: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
  purple: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
  blue: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
};

export function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const variants = {
    primary: 'bg-yellow-500 text-black hover:bg-yellow-400',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    ghost: 'text-gray-400 hover:bg-gray-800 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Table({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {head.map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/70">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-gray-500">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Banner shown when a page is rendering the demo dataset instead of live DB rows. */
export function DemoBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
      <span aria-hidden className="mt-0.5">
        ⚠
      </span>
      <p>{message}</p>
    </div>
  );
}

export const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Math.abs(n) < 1 ? 6 : 2,
  });

export const fmtNum = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const shortAddr = (a?: string) =>
  a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—';
