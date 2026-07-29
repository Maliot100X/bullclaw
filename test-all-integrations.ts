/**
 * BullClaw - Complete Integration Test
 * Tests ALL external services: ClawPump, Helius, Neon, Redis, Telegram
 */

import { Redis } from '@upstash/redis';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Test counter
let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<boolean>) {
  return fn().then(result => {
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  });
}

async function main() {
  console.log('\n🐂 BullClaw Integration Test Suite');
  console.log('================================\n');

  // 1. Environment Variables
  console.log('📋 Environment Variables:');
  const envVars = [
    'DATABASE_URL',
    'UPSTASH_REDIS_REST_URL', 
    'UPSTASH_REDIS_REST_TOKEN',
    'CLAWPUMP_API_KEY',
    'HELIUS_API_KEY',
    'HELIUS_RPC_URL',
    'TELEGRAM_BOT_TOKEN',
    'ENCRYPTION_KEY',
    'ANSEM_MINT',
    'ANSEM_WALLET',
    'NEXT_PUBLIC_BASE_URL'
  ];
  
  for (const key of envVars) {
    const value = process.env[key];
    if (value) {
      if (key.includes('KEY') || key.includes('TOKEN') || key.includes('PASSWORD') || key.includes('SECRET')) {
        console.log(`  ✅ ${key}: ${value.substring(0, 10)}...`);
      } else if (key === 'DATABASE_URL') {
        console.log(`  ✅ DATABASE_URL: postgresql://...`);
      } else {
        console.log(`  ✅ ${key}: ${value}`);
      }
    } else {
      console.log(`  ❌ ${key}: NOT SET`);
      failed++;
    }
  }
  console.log('');

  // 2. Encryption Test
  await test('AES-256-GCM Encryption', async () => {
    try {
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
      if (!ENCRYPTION_KEY) return false;
      
      const iv = crypto.randomBytes(16);
      const cipherKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
      const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, iv);
      
      const text = 'test-api-key-cpk_xxx';
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      
      // Decrypt
      const decipher = crypto.createDecipheriv('aes-256-gcm', cipherKey, iv);
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted === text;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 3. Redis Test
  await test('Upstash Redis Connection', async () => {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      const testKey = 'bullclaw:test:integration';
      const testValue = Date.now().toString();
      
      await redis.set(testKey, testValue, { ex: 60 });
      const retrieved = await redis.get<string>(testKey);
      await redis.del(testKey);
      
      return retrieved === testValue;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 4. Redis OTP Generation
  await test('Redis OTP Code Generation', async () => {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      await redis.set(`otc:${code}`, { type: 'test', createdAt: Date.now() }, { ex: 600 });
      const data = await redis.get(`otc:${code}`);
      await redis.del(`otc:${code}`);
      
      return data !== null;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 5. Neon Database Test
  await test('Neon Database Connection', async () => {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.user.count();
      await prisma.$disconnect();
      return true;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 6. Helius RPC Test
  await test('Helius RPC Connection', async () => {
    try {
      const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || '';
      if (!HELIUS_RPC_URL) return false;
      
      const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      });
      
      const data = await response.json();
      return data.result === 'ok' || response.ok;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 7. Helius Token Metadata
  await test('Helius Token Metadata API', async () => {
    try {
      const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
      const ANSEM_MINT = process.env.ANSEM_MINT || '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';
      
      if (!HELIUS_API_KEY) return false;
      
      const response = await fetch(
        `https://api.helius.xyz/v0/token_metadata?api-key=${HELIUS_API_KEY}&addresses=${ANSEM_MINT}`
      );
      
      return response.ok;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 8. ClawPump API Key Format
  await test('ClawPump API Key Format', async () => {
    const CLAWPUMP_API_KEY = process.env.CLAWPUMP_API_KEY || '';
    return CLAWPUMP_API_KEY.startsWith('cpk_') && CLAWPUMP_API_KEY.length > 10;
  });

  // 9. ClawPump Health Check
  await test('ClawPump API Health', async () => {
    try {
      const response = await fetch('https://clawpump.tech/api/health');
      return response.ok;
    } catch (e) {
      console.log('    Error:', (e as Error).message);
      return false;
    }
  });

  // 10. Solana Constants
  await test('Solana Constants (ANSEM Mint)', async () => {
    const ANSEM_MINT = process.env.ANSEM_MINT || '';
    return ANSEM_MINT === '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';
  });

  // 11. Telegram Bot Token Format
  await test('Telegram Bot Token Format', async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const parts = TELEGRAM_BOT_TOKEN.split(':');
    return parts.length === 2 && parts[0].length > 5 && parts[1].length > 20;
  });

  // 12. Base URL
  await test('Base URL Configured', async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
    return BASE_URL.startsWith('https://');
  });

  console.log('\n================================');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 ALL INTEGRATIONS WORKING!\n');
  } else {
    console.log('⚠️ Some integrations failed. Check above.\n');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
