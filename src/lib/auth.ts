import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import prisma from './prisma';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function generateOneTimeCode(): Promise<string> {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  return code;
}

export async function verifyOneTimeCode(code: string): Promise<{ telegramId?: string; wallet?: string } | null> {
  const key = `otc:${code}`;
  const value = await redis.get(key);

  if (!value) return null;

  // Redis returns object directly, not string
  const data = typeof value === 'string' ? JSON.parse(value) : value;
  await redis.del(key);

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
  // First try Redis cache
  const key = `session:${token}`;
  const value = await redis.get(key);

  if (value) {
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    if (data.expiresAt < Date.now()) {
      await redis.del(key);
      return null;
    }
    return { userId: data.userId };
  }

  // Fallback to Prisma database
  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return { userId: session.userId };
  } catch (error) {
    console.error('Error getting session from Prisma:', error);
    return null;
  }
}

export async function invalidateSession(token: string): Promise<void> {
  const key = `session:${token}`;
  await redis.del(key);
  
  // Also delete from Prisma
  try {
    await prisma.session.delete({ where: { token } });
  } catch (error) {
    // Ignore if not found
  }
}
