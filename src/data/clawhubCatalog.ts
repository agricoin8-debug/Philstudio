import { ClawHubSkill } from '../types';

export const CLAWHUB_SKILLS_CATALOG: ClawHubSkill[] = [
  {
    id: 'clawhub-solana-agent-kit',
    slug: 'sendaifun/solana-agent-kit',
    name: 'Solana Agent Kit (SendAI)',
    author: 'sendaifun',
    authorAvatar: 'https://avatars.githubusercontent.com/u/161879000?s=200&v=4',
    category: 'crypto',
    version: '1.4.2',
    description: 'Autonomous Solana toolkit: Jupiter swaps, Pyth price oracles, SPL token transfers, Blinks, staking, and Pump.fun deployment.',
    stars: 1840,
    downloads: 38200,
    verified: true,
    securityAudit: 'passed',
    tags: ['solana', 'defi', 'jupiter', 'pyth', 'blinks', 'pumpfun', 'web3'],
    parametersSchema: '{"action": "swap | transfer | stake | deploy_token | rugcheck | price_feed", "params": {"network": "devnet | mainnet-beta", "amount": "number", "mint": "string"}}',
    systemDirective: `You are equipped with the Solana Agent Kit (@sendaifun/solana-agent-kit). 
You have autonomous capabilities to:
1. Execute and simulate DEX swaps via Jupiter Aggregator with optimal routing, slippage control, and minimal price impact.
2. Query real-time Pyth Network cryptographic oracle prices for SOL, JUP, BONK, RAY, and USDC.
3. Generate Solana Actions & Blinks (dialect specification) for social viral execution.
4. Deploy SPL tokens and pump.fun bonding curve tokens with custom metadata.
5. Inspect Solana token mints for rug risks, freeze authorities, and liquidity locks.
Always provide transaction signatures, explorer links (Solana Explorer or Solscan), and route transparency.`,
    skillMd: `# Solana Agent Kit (@sendaifun/solana-agent-kit)
Connect any AI Agent to Solana protocols with over 60+ autonomous blockchain tools.

## Plugins
- **@solana-agent-kit/plugin-token**: Jupiter swaps, Raydium liquidity, SPL token minting & transfers.
- **@solana-agent-kit/plugin-defi**: Liquid staking with Marinade & Jito, lending, and yield farming.
- **@solana-agent-kit/plugin-misc**: Pyth Network real-time price feeds, Solana SNS domains, devnet faucets.
- **@solana-agent-kit/plugin-blinks**: Generate shareable Solana Actions and interactive Blink URLs.
- **@solana-agent-kit/plugin-nft**: Metaplex NFT minting and collection management.

## Example Usage
\`\`\`typescript
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  'https://api.mainnet-beta.solana.com',
  process.env.OPENAI_API_KEY!
);

// Execute autonomous Jupiter swap
const txSignature = await agent.trade(
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // Output token (JUP)
  0.5, // Amount in SOL
  'So11111111111111111111111111111111111111112', // Input token (SOL)
  50 // Slippage in bps (0.5%)
);
\`\`\`
`,
    updatedAt: '2026-09-08',
  },
  {
    id: 'clawhub-rugcheck-auditor',
    slug: 'openclaw/rugcheck-auditor',
    name: 'Solana RugCheck Security Auditor',
    author: 'openclaw',
    category: 'security',
    version: '1.2.0',
    description: 'Deep audit of Solana SPL token smart contracts: checks freeze authority, mint authority, LP locking, and top holder centralization.',
    stars: 920,
    downloads: 14500,
    verified: true,
    securityAudit: 'passed',
    tags: ['security', 'solana', 'rugcheck', 'audit', 'honeypot'],
    parametersSchema: '{"mintAddress": "string", "strictMode": "boolean"}',
    systemDirective: 'Analyze Solana token mints with institutional rigor: verify if mint authority is revoked, freeze authority is disabled, LP tokens are burned/locked, and compute the Gini coefficient of top holders. Output a clear safety score (0-100) and actionable risk warnings.',
    skillMd: `# Solana RugCheck Security Auditor
Autonomous smart contract and token risk evaluation engine for the Solana ecosystem.

## Checks Performed
- **Mint Authority**: Is the creator able to print infinite tokens?
- **Freeze Authority**: Can token accounts be arbitrarily frozen?
- **Liquidity Lock**: Are Raydium / Meteora LP tokens burned or locked?
- **Holder Centralization**: Do top 10 wallets hold > 25% of the circulating supply?
`,
    updatedAt: '2026-08-30',
  },
  {
    id: 'clawhub-pyth-price-oracle',
    slug: 'openclaw/pyth-price-oracle',
    name: 'Pyth Network Price Oracle',
    author: 'openclaw',
    category: 'crypto',
    version: '2.0.1',
    description: 'Sub-second real-time cryptographic asset prices from Pyth Network oracles across Solana, EVM, and equities.',
    stars: 760,
    downloads: 19800,
    verified: true,
    securityAudit: 'passed',
    tags: ['pyth', 'oracle', 'crypto', 'solana', 'prices'],
    parametersSchema: '{"symbols": ["SOL", "BTC", "ETH", "JUP"], "currency": "USD"}',
    systemDirective: 'Fetch and format high-precision financial data using Pyth Network feeds. Include confidence intervals, 24h change, and feed publishing timestamps.',
    skillMd: `# Pyth Network Price Oracle
Real-time financial market data directly from first-party publishers on the Pyth decentralized oracle network.
`,
    updatedAt: '2026-09-01',
  },
  {
    id: 'clawhub-docker-sandbox',
    slug: 'openclaw/docker-sandbox',
    name: 'Dockerized Sandbox Runner',
    author: 'openclaw',
    category: 'system',
    version: '2.3.0',
    description: 'Spawns ephemeral rootless Docker containers to execute untrusted scripts, compile code, and run integration tests.',
    stars: 2150,
    downloads: 52000,
    verified: true,
    securityAudit: 'passed',
    tags: ['docker', 'sandbox', 'containers', 'devops'],
    parametersSchema: '{"image": "node:20-alpine | python:3.11-slim", "commands": ["string"], "timeoutMs": "number"}',
    systemDirective: 'Provide secure containerization plans and isolated command sequences. Ensure non-root execution and memory limit flags (e.g. --memory=512m).',
    skillMd: `# Dockerized Sandbox Runner
Isolated runtime execution for untrusted agent workflows.
`,
    updatedAt: '2026-09-04',
  },
  {
    id: 'clawhub-k8s-mesh',
    slug: 'openclaw/k8s-manifest-generator',
    name: 'Kubernetes Mesh & Helm Synthesizer',
    author: 'openclaw',
    category: 'developer',
    version: '1.9.0',
    description: 'Generates zero-downtime Helm charts, Kubernetes StatefulSets, ingress controllers, and network security policies.',
    stars: 1420,
    downloads: 31000,
    verified: true,
    securityAudit: 'passed',
    tags: ['k8s', 'kubernetes', 'helm', 'devops', 'cloud'],
    parametersSchema: '{"appType": "web | worker | stateful", "replicas": "number", "ingressHost": "string"}',
    systemDirective: 'Generate production-grade Kubernetes YAML specifications with resource limits (cpu/memory), readiness/liveness probes, pod anti-affinity, and non-root securityContexts.',
    skillMd: `# Kubernetes Mesh & Helm Synthesizer
Enterprise-grade cloud-native infrastructure automation.
`,
    updatedAt: '2026-08-25',
  },
  {
    id: 'clawhub-arxiv-grounder',
    slug: 'openclaw/arxiv-deep-grounder',
    name: 'arXiv Academic Grounder',
    author: 'community-ai',
    category: 'research',
    version: '1.3.4',
    description: 'Autonomous scientific research agent: searches arXiv, parses LaTeX equations, and extracts state-of-the-art benchmark findings.',
    stars: 1110,
    downloads: 24000,
    verified: false,
    securityAudit: 'passed',
    tags: ['arxiv', 'academic', 'research', 'latex', 'math'],
    parametersSchema: '{"query": "string", "category": "cs.AI | cs.CL | stat.ML", "maxPapers": "number"}',
    systemDirective: 'Synthesize research papers from arXiv with rigorous mathematical rigor, citing paper IDs (e.g. arXiv:2403.xxxxx), methodologies, and comparative ablation tables.',
    skillMd: `# arXiv Academic Grounder
Deep academic literature research and mathematical synthesis.
`,
    updatedAt: '2026-08-20',
  },
  {
    id: 'clawhub-discord-ops',
    slug: 'openclaw/discord-slash-ops',
    name: 'Discord Slash Command Orchestrator',
    author: 'community-ai',
    category: 'communication',
    version: '2.1.0',
    description: 'Registers dynamic Discord Application Commands, embeds, ephemeral responses, and interactive button callbacks.',
    stars: 870,
    downloads: 18200,
    verified: false,
    securityAudit: 'passed',
    tags: ['discord', 'bot', 'slash-commands', 'community'],
    parametersSchema: '{"commandName": "string", "options": ["object"]}',
    systemDirective: 'Structure Discord interactions with Rich Embeds, appropriate color coding (e.g. 0x5865F2 blurple), action buttons, and modal dialog schemas.',
    skillMd: `# Discord Slash Command Orchestrator
Interactive Discord agent bot protocol.
`,
    updatedAt: '2026-08-15',
  },
];
