import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/ui/Header";
import StatBar from "@/components/ui/StatBar";

export const metadata: Metadata = {
  title: "BullClaw — Agentic Finance on Solana",
  description: "Powered by ClawPump. Utility layer for $ANSEM. Create and run real ClawPump agents that trade $ANSEM, run perps, and earn 65% fees.",
  keywords: ["BullClaw", "AI agents", "Solana", "$ANSEM", "ClawPump", "trading", "perpetuals"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#08080f" }}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <StatBar />
      </body>
    </html>
  );
}
