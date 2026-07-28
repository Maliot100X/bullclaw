import { NextRequest, NextResponse } from 'next/server';
import { generateOneTimeCode, storeOneTimeCode } from '@/lib/auth';
import { z } from 'zod';

const AgentRegisterSchema = z.object({
  agentName: z.string().min(1).max(100),
  agentId: z.string().min(1).max(100),
  model: z.string().optional(),
  persona: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AgentRegisterSchema.parse(body);

    // Generate one-time code for agent
    const code = await generateOneTimeCode();

    // Store agent data in Redis (temporary)
    await storeOneTimeCode(code, undefined, undefined);

    // Store agent details in a separate key
    const agentDataKey = `agent_reg:${code}`;
    const redis = await import('@upstash/redis').then(m => new m.Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }));

    await redis.set(agentDataKey, JSON.stringify({
      agentName: parsed.agentName,
      agentId: parsed.agentId,
      model: parsed.model || 'claude-sonnet-4-6',
      persona: parsed.persona || 'Default Agent',
      registeredAt: Date.now(),
    }), { ex: 600 });

    return NextResponse.json(
      {
        code,
        expiresIn: 600,
        message: 'One-time code generated. Call /api/v1/confirm with this code.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Agent registration failed' },
      { status: 500 }
    );
  }
}
