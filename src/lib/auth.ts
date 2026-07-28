import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function generateOneTimeCode(): Promise<string> {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  return code;
}

export async function storeOneTimeCode(code: string, telegramId?: string, wallet?: string): Promise<void> {
  const key = `otc:${code}`;
  const value = JSON.stringify({
    telegramId,
    wallet,
    createdAt: Date.now(),
  });

  await redis.set(key, value, { ex: 600 }); // 10 minutes
}

export async function verifyOneTimeCode(code: string): Promise<{ telegramId?: string; wallet?: string } | null> {
  const key = `otc:${code}`;
  const value = await redis.get(key);

  if (!value) return null;

  const data = JSON.parse(value as string);
  await redis.del(key); // One-time use

  return data;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function storeSession(token: string, userId: string, expiresIn: number = 604800): Promise<void> {
  const key = `session:${token}`;
  const expiresAt = Date.now() + expiresIn * 1000;

  await redis.set(key, JSON.stringify({ userId, expiresAt }), { ex: expiresIn });
}

export async function getSession(token: string): Promise<{ userId: string } | null> {
  const key = `session:${token}`;
  const value = await redis.get(key);

  if (!value) return null;

  const data = JSON.parse(value as string);

  if (data.expiresAt < Date.now()) {
    await redis.del(key);
    return null;
  }

  return { userId: data.userId };
}

export async function invalidateSession(token: string): Promise<void> {
  const key = `session:${token}`;
  await redis.del(key);
}
