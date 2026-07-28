export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 gradient-bull bg-clip-text text-transparent">
          BullClaw
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          Agentic Finance on Solana
        </p>
        <p className="text-lg text-gray-400 mb-12">
          Powered by ClawPump. Utility layer for $ANSEM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-2">Real Agents</h2>
            <p className="text-gray-400">Non-custodial wallets, real trades</p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-2">Full Dashboard</h2>
            <p className="text-gray-400">Web + Telegram feature parity</p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-2">$ANSEM Utility</h2>
            <p className="text-gray-400">Holder benefits & premium access</p>
          </div>
        </div>

        <div className="mt-12 flex gap-4 justify-center">
          <button className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition">
            Get Started
          </button>
          <button className="px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
