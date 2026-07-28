'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import { Card, CardHeader, DemoBanner } from '@/components/ui';
import { demoChat } from '@/lib/demo-data';

interface Message {
  role: 'user' | 'agent';
  content: string;
  at: string;
}

const SUGGESTIONS = [
  'What is your current exposure?',
  'Close all open positions.',
  'Why did you take that last trade?',
  'Tighten stops to breakeven.',
];

export default function AgentChatPage() {
  const { agent, demo, notice } = useAgent();
  const [messages, setMessages] = useState<Message[]>(demoChat);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    const body = text.trim();
    if (!body || thinking) return;

    const stamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    setMessages((prev) => [...prev, { role: 'user', content: body, at: stamp }]);
    setDraft('');
    setThinking(true);

    // No agent runtime is reachable from the dashboard yet, so the reply is a
    // clearly-labelled stand-in rather than a fabricated trading answer.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: `[demo] ${agent?.name ?? 'This agent'} is not connected to a live ClawPump runtime in this environment, so I can't act on "${body}". Attach CLAWPUMP_API_KEY and a database to enable real replies.`,
          at: stamp,
        },
      ]);
      setThinking(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <Card className="flex h-[32rem] flex-col">
        <CardHeader
          title={`Chat with ${agent?.name ?? 'agent'}`}
          icon={MessageSquare}
          subtitle="Plain-language instructions, executed under your risk limits"
        />

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-yellow-500 text-black'
                    : 'border border-gray-800 bg-gray-950 text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    m.role === 'user' ? 'text-black/50' : 'text-gray-600'
                  }`}
                >
                  {m.at}
                </p>
              </div>
            </div>
          ))}

          {thinking ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3">
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={thinking}
                className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-400 transition hover:border-gray-700 hover:text-white disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tell the agent what to do…"
              className="min-w-0 flex-1 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
              aria-label="Send message"
              className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
