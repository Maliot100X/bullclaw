import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function generateToken(): string {
  return `bc_${crypto.randomBytes(32).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, telegram } = await req.json();

    const telegramId = telegram?.replace("@", "") || null;

    // Try to find existing user
    let user = null;
    
    if (wallet) {
      user = await prisma.user.findUnique({ where: { wallet } });
    }
    
    if (!user && telegramId) {
      user = await prisma.user.findUnique({ where: { telegramId } });
    }

    // Create new user if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet: wallet || null,
          telegramId: telegramId,
          riskLevel: "medium",
        },
      });
    }

    // Create session
    const token = generateToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, wallet: user.wallet, telegramId: user.telegramId },
      sessionToken: token,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
