import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateToken(): string {
  return `bc_${crypto.randomBytes(32).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, telegram } = await req.json();

    // Clean telegram handle
    const telegramId = telegram?.replace("@", "") || null;

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          wallet ? { wallet } : undefined,
          telegramId ? { telegramId } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          wallet: wallet || null,
          telegramId,
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
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
