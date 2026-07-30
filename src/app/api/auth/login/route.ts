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
    } else if (telegramId) {
      user = await prisma.user.findUnique({ where: { telegramId } });
    } else if (wallet) {
      user = await prisma.user.findUnique({ where: { wallet } });
      if (!user) {
        return NextResponse.json({ error: "No account found. Please register first." }, { status: 404 });
      }
    }

    // Don't auto-create - user must register first
    if (!user) {
      return NextResponse.json({ error: "No account found. Please register first." }, { status: 404 });
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
