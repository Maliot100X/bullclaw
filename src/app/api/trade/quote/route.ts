import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps") || "50";

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Try Jupiter first with API key
    try {
      const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
      const headers: HeadersInit = {};
      if (process.env.JUPITER_API_KEY) {
        headers["Authorization"] = `Bearer ${process.env.JUPITER_API_KEY}`;
      }
      const res = await fetch(jupiterUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers
      });
      if (res.ok) {
        const quote = await res.json();
        return NextResponse.json({
          success: true,
          data: {
            inputAmount: quote.inAmount,
            outputAmount: quote.outAmount,
            price: quote.price,
            routePlan: quote.routePlan,
            slippageBps: quote.slippageBps,
            source: "jupiter",
          },
        });
      }
    } catch {}

    // Fallback: return estimated quote using DexScreener prices
    try {
      const [inRes, outRes] = await Promise.all([
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${inputMint}`),
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${outputMint}`),
      ]);
      const inData = await inRes.json();
      const outData = await outRes.json();
      const inPrice = parseFloat(inData?.pairs?.[0]?.priceUsd || "0");
      const outPrice = parseFloat(outData?.pairs?.[0]?.priceUsd || "0");

      if (inPrice > 0 && outPrice > 0) {
        const amountNum = parseFloat(amount);
        const estimatedOut = (amountNum * inPrice) / outPrice;
        return NextResponse.json({
          success: true,
          data: {
            inputAmount: amount,
            outputAmount: Math.floor(estimatedOut).toString(),
            price: (inPrice / outPrice).toString(),
            routePlan: [],
            slippageBps: parseInt(slippageBps),
            source: "dexscreener-estimate",
          },
        });
      }
    } catch {}

    return NextResponse.json({ error: "Quote unavailable" }, { status: 503 });
  } catch (error) {
    return NextResponse.json({ error: "Quote failed" }, { status: 500 });
  }
}
