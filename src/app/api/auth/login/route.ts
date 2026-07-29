import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function generateToken(): string {
  return `bc_${crypto.randomBytes(32).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, telegramId, wallet } = await req.json();

    if (!apiKey && !telegramId && !wallet) {
      return NextResponse.json({ error: "Provide API key, telegramId, or wallet" }, { status: 400 });
    }

    let user;

    if (apiKey) {
      user = await prisma.user.findFirst({
        where: { 
          OR: [
            { telegramId: apiKey.startsWith("tg_") ? apiKey.replace("tg_", "") : undefined },
            { wallet: apiKey }
          ]
        }
      });
      if (!user) {
        user = await prisma.user.create({
          data: { telegramId: apiKey.startsWith("tg_") ? apiKey.replace("tg_", "") : null, wallet: wallet || null, riskLevel: "medium" },
        });
      }
    } else if (telegramId) {
      user = await prisma.user.findUnique({ where: { telegramId } });
      if (!user) {
        user = await prisma.user.create({ data: { telegramId, riskLevel: "medium" } });
      }
    } else if (wallet) {
      user = await prisma.user.findUnique({ where: { wallet } });
      if (!user) {
        user = await prisma.user.create({ data: { wallet, riskLevel: "medium" } });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const token = generateToken();
    await prisma.session.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return NextResponse.json({ success: true, user: { id: user.id, wallet: user.wallet, telegramId: user.telegramId }, sessionToken: token, expiresIn: 604800 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
