export type AgentMode = 'auto' | 'fast' | 'thinking' | 'research' | 'task' | 'ultra';

export interface PowerSettings {
  unrestrictedDepth: boolean;
  historyLimit: number;
  customSystemPrompt: string;
  forceSearch: boolean;
  temperature: number;
}

export interface GroundingSource {
  title?: string;
  url?: string;
  snippet?: string;
}

export interface AggregatedSource extends GroundingSource {
  domain: string;
  sourceMessageId: string;
  queryPrompt?: string;
  timestamp: number;
}

export interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  output?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: AgentMode;
  modelUsed?: string;
  thinkingContent?: string;
  groundingSources?: GroundingSource[];
  taskSteps?: TaskStep[];
  latencyMs?: number;
}

export interface AgentStatus {
  status: 'online' | 'degraded' | 'offline';
  models: {
    fast: string;
    thinking: string;
    standard: string;
  };
  features: string[];
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  category: 'developer' | 'system' | 'research' | 'communication' | 'crypto' | 'security' | 'custom';
  enabled: boolean;
  version: string;
  icon?: string;
  parametersSchema?: string;
  systemDirective: string;
  isBuiltIn?: boolean;
}

export interface MemoryEntry {
  id: string;
  category: 'preference' | 'project' | 'technical' | 'identity' | 'general';
  key: string;
  value: string;
  timestamp: number;
  importance: 'high' | 'medium' | 'low';
  enabled: boolean;
}

export type GatewayPlatform = 'discord' | 'slack' | 'telegram' | 'whatsapp' | 'webhook';

export interface GatewayChannel {
  id: string;
  platform: GatewayPlatform;
  name: string;
  status: 'connected' | 'idle' | 'disconnected';
  webhookUrl?: string;
  botUsername?: string;
  lastActive?: number;
  messagesCount: number;
  enabled: boolean;
}

export interface GatewayEvent {
  id: string;
  platform: GatewayPlatform;
  direction: 'inbound' | 'outbound';
  sender: string;
  content: string;
  timestamp: number;
  status: 'delivered' | 'processed' | 'pending';
}

// ClawHub Public Skill Registry Types (https://github.com/openclaw/clawhub)
export type ClawHubCategory = 'all' | 'crypto' | 'developer' | 'system' | 'research' | 'security' | 'communication';

export interface ClawHubSkill {
  id: string;
  slug: string;
  name: string;
  author: string;
  authorAvatar?: string;
  category: ClawHubCategory;
  version: string;
  description: string;
  stars: number;
  downloads: number;
  verified: boolean;
  securityAudit: 'passed' | 'reviewing' | 'community';
  tags: string[];
  parametersSchema: string;
  systemDirective: string;
  skillMd: string;
  updatedAt: string;
  installed?: boolean;
}

// Solana Agent Kit Types (https://github.com/sendaifun/solana-agent-kit)
export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

export interface SolanaTokenBalance {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  decimals: number;
  usdValue: number;
  icon?: string;
}

export interface SolanaWalletState {
  publicKey: string;
  balanceSOL: number;
  network: SolanaNetwork;
  tokens: SolanaTokenBalance[];
}

export interface JupiterRouteLeg {
  protocol: string;
  percentage: number;
  inToken: string;
  outToken: string;
}

export interface JupiterSwapSimulation {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  priceImpactPct: number;
  feeSOL: number;
  routes: JupiterRouteLeg[];
  txSignature?: string;
  status: 'quoted' | 'simulated' | 'confirmed';
}

export interface PythPriceFeed {
  symbol: string;
  name: string;
  price: number;
  confidence: number;
  change24h: number;
  lastUpdated: number;
}

export interface SolanaBlinkSpec {
  title: string;
  icon: string;
  description: string;
  label: string;
  recipientAddress: string;
  amountOptions: number[];
  actionUrl: string;
}

export interface RugCheckAuditResult {
  mint: string;
  name: string;
  symbol: string;
  score: number; // 0-100 (100 is safest)
  riskLevel: 'good' | 'warning' | 'danger';
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
  lpLocked: boolean;
  topHoldersSharePct: number;
  risksDetected: string[];
}

