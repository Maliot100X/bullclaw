'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback, useState } from 'react';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { shortAddr } from '@/components/ui';

export function WalletButton() {
  const { publicKey, disconnect, connecting, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleConnect = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setMenuOpen(false);
  }, [disconnect]);

  if (connecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-2 text-sm text-yellow-500"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
        Connecting...
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-700"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
          <Wallet className="h-3 w-3 text-black" />
        </div>
        <span className="font-mono">{shortAddr(publicKey.toBase58())}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 min-w-[200px] rounded-lg border border-gray-800 bg-gray-900 py-2 shadow-xl">
            <div className="border-b border-gray-800 px-4 py-2">
              <p className="text-xs text-gray-500">Connected wallet</p>
              <p className="truncate font-mono text-sm text-white">
                {publicKey.toBase58()}
              </p>
            </div>
            <a
              href={`https://solscan.io/account/${publicKey.toBase58()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              View on Solscan
            </a>
            <button
              onClick={handleDisconnect}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
