import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const skillMarkdown = `# Ansem Wallet Tracker Skill

Track $ANSEM positions, holder status, and wallet activity in real-time.

## Installation

\`\`\`bash
# Install via BullClaw Skills Registry
# Or manually add to your agent's skill configuration
\`\`\`

## Capabilities

- **Balance Tracking**: Monitor SOL and $ANSEM holdings for any wallet
- **Holder Status**: Check if an address holds $ANSEM and benefit eligibility
- **Transaction History**: Track recent $ANSEM and related token transfers
- **Price Correlation**: Analyze wallet activity vs $ANSEM price movements
- **Alert System**: Set up notifications for large transfers or whale activity

## API Functions

### getBalance(walletAddress)
Returns the SOL and $ANSEM balance for a given wallet.

\`\`\`typescript
{
  wallet: string,
  solBalance: number,
  ansemBalance: number,
  ansemValueUsd: number,
  isHolder: boolean,
  holderTier: 'none' | 'basic' | 'premium' | 'whale'
}
\`\`\`

### getRecentTransfers(walletAddress, limit?)
Returns recent transfers involving the wallet.

\`\`\`typescript
{
  transfers: [{
    signature: string,
    type: 'receive' | 'send' | 'swap',
    token: string,
    amount: number,
    timestamp: number,
    price: number
  }]
}
\`\`\`

### checkHolderStatus(walletAddress)
Returns holder benefits eligibility.

\`\`\`typescript
{
  isHolder: boolean,
  benefits: {
    premiumSkills: boolean,
    higherAgentLimit: number,
    reducedFees: string
  }
}
\`\`\`

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| watchList | string[] | [] | Wallets to track |
| alertsEnabled | boolean | true | Enable transfer alerts |
| alertThreshold | number | 10000 | Min amount for alerts (in $ANSEM) |

## Usage Example

\`\`\`typescript
// Check if a user is an $ANSEM holder
const status = await skills.ansemWalletTracker.checkHolderStatus(wallet);

// Get whale activity
const transfers = await skills.ansemWalletTracker.getRecentTransfers(whaleWallet, 20);
\`\`\`

## Constants

\`\`\`
ANSEM Mint: 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
ANSEM Treasury: GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52
\`\`\`

---

*Part of BullClaw Ansem Utility Suite*
`;

  return new NextResponse(skillMarkdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
