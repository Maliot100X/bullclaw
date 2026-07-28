export interface BullClawUser {
  id: string;
  wallet?: string;
  telegramId?: string;
  telegramUsername?: string;
  ansemHolder: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface BullClawAgent {
  id: string;
  userId: string;
  clawpumpAgentId?: string;
  walletAddress?: string;
  name: string;
  persona: string;
  model: string;
  template: string;
  avatar?: string;
  description?: string;
  skillsJson: string;
  status: 'active' | 'paused' | 'deleted';
  totalPnL: number;
  feeEarnings: number;
  listedForSale: boolean;
  salePrice?: number;
  publicShareLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BullClawTrade {
  id: string;
  agentId: string;
  type: 'spot_buy' | 'spot_sell' | 'perp_long' | 'perp_short' | 'perp_close';
  tokenMint: string;
  tokenSymbol: string;
  inputAmount: number;
  outputAmount: number;
  executedPrice: number;
  fee: number;
  pnl: number;
  txSignature?: string;
  createdAt: Date;
}

export interface BullClawSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  source: 'clawpump' | 'solana' | 'helius' | 'custom';
  enabled: boolean;
  config?: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  agentId?: string;
  action: string;
  details: string;
  createdAt: Date;
}
