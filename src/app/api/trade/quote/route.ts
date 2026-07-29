import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps") || "50";

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json({ error: "Missing params: inputMint, outputMint, amount required" }, { status: 400 });
    }

    const res = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Quote failed" }, { status: 500 });
    }

    const quote = await res.json();
    return NextResponse.json({
      success: true,
      data: {
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        price: quote.price,
        routePlan: quote.routePlan,
        slippageBps: quote.slippageBps,
      },
    });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json({ error: "Quote failed" }, { status: 500 });
  }
}
