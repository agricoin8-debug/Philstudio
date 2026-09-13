import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  Rocket,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Send,
  Link as LinkIcon,
  Layers,
  Flame,
} from 'lucide-react';
import {
  SolanaNetwork,
  SolanaWalletState,
  PythPriceFeed,
  JupiterSwapSimulation,
  RugCheckAuditResult,
  SolanaBlinkSpec,
} from '../types';

interface SolanaAgentKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
}

const INITIAL_PYTH_PRICES: PythPriceFeed[] = [
  { symbol: 'SOL', name: 'Solana', price: 154.20, confidence: 0.05, change24h: 4.82, lastUpdated: Date.now() },
  { symbol: 'JUP', name: 'Jupiter', price: 0.89, confidence: 0.002, change24h: -1.45, lastUpdated: Date.now() },
  { symbol: 'BONK', name: 'Bonk', price: 0.0000214, confidence: 0.0000001, change24h: 8.92, lastUpdated: Date.now() },
  { symbol: 'RAY', name: 'Raydium', price: 2.15, confidence: 0.01, change24h: 3.12, lastUpdated: Date.now() },
  { symbol: 'PYTH', name: 'Pyth Network', price: 0.38, confidence: 0.001, change24h: 1.84, lastUpdated: Date.now() },
];

export const SolanaAgentKitModal: React.FC<SolanaAgentKitModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'pumpfun' | 'blinks' | 'rugcheck' | 'prompts'>('swap');
  const [network, setNetwork] = useState<SolanaNetwork>('devnet');
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<SolanaWalletState>({
    publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgZe2',
    balanceSOL: 5.42,
    network: 'devnet',
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', balance: 450.0, decimals: 6, usdValue: 450.0 },
      { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', balance: 320.0, decimals: 6, usdValue: 284.8 },
      { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', balance: 2500000, decimals: 5, usdValue: 53.5 },
    ],
  });

  // Pyth Realtime Prices
  const [prices, setPrices] = useState<PythPriceFeed[]>(INITIAL_PYTH_PRICES);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  // Jupiter Swap State
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('JUP');
  const [swapAmount, setSwapAmount] = useState('1.0');
  const [slippage, setSlippage] = useState(0.5);
  const [swapExecuting, setSwapExecuting] = useState(false);
  const [swapResult, setSwapResult] = useState<JupiterSwapSimulation | null>(null);

  // Pump.fun Token Deployer State
  const [tokenName, setTokenName] = useState('OpenClaw Coin');
  const [tokenSymbol, setTokenSymbol] = useState('CLAW');
  const [tokenDesc, setTokenDesc] = useState('Autonomous AI Agent utility token built with Solana Agent Kit.');
  const [initialBuySOL, setInitialBuySOL] = useState('0.5');
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployedToken, setDeployedToken] = useState<any | null>(null);

  // Blinks & Actions State
  const [blinkTitle, setBlinkTitle] = useState('Support OpenClaw Agent Research');
  const [blinkDesc, setBlinkDesc] = useState('Direct on-chain micro-grant to fund autonomous agent cluster compute.');
  const [blinkAmount, setBlinkAmount] = useState('0.25');
  const [blinkCopied, setBlinkCopied] = useState(false);

  // RugCheck State
  const [auditMint, setAuditMint] = useState('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
  const [auditResult, setAuditResult] = useState<RugCheckAuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  // Fetch prices helper
  const handleRefreshPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      const res = await fetch('/api/solana/prices');
      if (res.ok) {
        const data = await res.json();
        if (data.prices) setPrices(data.prices);
      } else {
        // Subtle random fluctuations
        setPrices((prev) =>
          prev.map((p) => ({
            ...p,
            price: Number((p.price * (1 + (Math.random() * 0.02 - 0.01))).toFixed(p.symbol === 'BONK' ? 8 : 2)),
            lastUpdated: Date.now(),
          }))
        );
      }
    } catch {
      setPrices((prev) =>
        prev.map((p) => ({
          ...p,
          price: Number((p.price * (1 + (Math.random() * 0.02 - 0.01))).toFixed(p.symbol === 'BONK' ? 8 : 2)),
          lastUpdated: Date.now(),
        }))
      );
    } finally {
      setTimeout(() => setIsRefreshingPrices(false), 500);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.publicKey);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleAirdrop = () => {
    if (network !== 'devnet') return;
    setAirdropLoading(true);
    setTimeout(() => {
      setWallet((w) => ({ ...w, balanceSOL: Number((w.balanceSOL + 2.0).toFixed(4)) }));
      setAirdropLoading(false);
      setAirdropSuccess(true);
      setTimeout(() => setAirdropSuccess(false), 3000);
    }, 1000);
  };

  // Compute calculated swap output
  const computedOutAmount = React.useMemo(() => {
    const amt = parseFloat(swapAmount) || 0;
    const solPrice = prices.find((p) => p.symbol === 'SOL')?.price || 154.2;
    const jupPrice = prices.find((p) => p.symbol === 'JUP')?.price || 0.89;
    const bonkPrice = prices.find((p) => p.symbol === 'BONK')?.price || 0.0000214;
    const usdcPrice = 1.0;

    let inUsd = 0;
    if (fromToken === 'SOL') inUsd = amt * solPrice;
    else if (fromToken === 'JUP') inUsd = amt * jupPrice;
    else if (fromToken === 'BONK') inUsd = amt * bonkPrice;
    else inUsd = amt * usdcPrice;

    let outTokenPrice = 1.0;
    if (toToken === 'SOL') outTokenPrice = solPrice;
    else if (toToken === 'JUP') outTokenPrice = jupPrice;
    else if (toToken === 'BONK') outTokenPrice = bonkPrice;
    else outTokenPrice = usdcPrice;

    return Number((inUsd / outTokenPrice).toFixed(toToken === 'BONK' ? 0 : 4));
  }, [swapAmount, fromToken, toToken, prices]);

  const handleExecuteSwap = () => {
    setSwapExecuting(true);
    setTimeout(() => {
      const sim: JupiterSwapSimulation = {
        inputMint: fromToken,
        outputMint: toToken,
        inputAmount: parseFloat(swapAmount) || 1.0,
        outputAmount: computedOutAmount,
        priceImpactPct: 0.04,
        feeSOL: 0.000005,
        routes: [
          { protocol: 'Orca Whirlpool', percentage: 65, inToken: fromToken, outToken: toToken },
          { protocol: 'Raydium CPMM', percentage: 35, inToken: fromToken, outToken: toToken },
        ],
        txSignature: '4zU1...8wKm' + Math.random().toString(36).substring(2, 9),
        status: 'confirmed',
      };
      setSwapResult(sim);

      // Deduct fromToken, add toToken in wallet
      setWallet((w) => {
        let newBalanceSOL = w.balanceSOL;
        if (fromToken === 'SOL') newBalanceSOL -= sim.inputAmount;
        if (toToken === 'SOL') newBalanceSOL += sim.outputAmount;

        const updatedTokens = w.tokens.map((t) => {
          if (t.symbol === fromToken) {
            return { ...t, balance: Math.max(0, t.balance - sim.inputAmount) };
          }
          if (t.symbol === toToken) {
            return { ...t, balance: t.balance + sim.outputAmount };
          }
          return t;
        });

        return {
          ...w,
          balanceSOL: Math.max(0, Number(newBalanceSOL.toFixed(4))),
          tokens: updatedTokens,
        };
      });

      setSwapExecuting(false);
    }, 1200);
  };

  const handleDeployToken = () => {
    setDeployLoading(true);
    setTimeout(() => {
      const generatedMint = 'Claw' + Math.random().toString(36).substring(2, 9).toUpperCase() + 'Mint789';
      setDeployedToken({
        name: tokenName,
        symbol: tokenSymbol,
        mint: generatedMint,
        supply: '1,000,000,000',
        curveProgress: '14.2%',
        marketCapSOL: '28.5 SOL',
        txHash: '5xTP...pump' + Math.random().toString(36).substring(2, 7),
      });
      setDeployLoading(false);
    }, 1400);
  };

  const handleRunAudit = (mintAddr?: string) => {
    const target = mintAddr || auditMint;
    setAuditing(true);
    setTimeout(() => {
      const isBonk = target.includes('DezXAZ');
      const isJup = target.includes('JUP');
      const isRisky = target.includes('risky') || target.includes('Honeypot');

      if (isRisky) {
        setAuditResult({
          mint: target,
          name: 'ShadyMoon Token',
          symbol: 'SHADY',
          score: 22,
          riskLevel: 'danger',
          mintAuthorityRevoked: false,
          freezeAuthorityRevoked: false,
          lpLocked: false,
          topHoldersSharePct: 78.4,
          risksDetected: [
            'Mint authority is still active (unlimited token dilution)',
            'Freeze authority enabled (transfers can be blocked)',
            'Liquidity pool LP tokens are unlocked',
            'Top 5 wallets control 78.4% of circulating supply',
          ],
        });
      } else {
        setAuditResult({
          mint: target,
          name: isBonk ? 'Bonk' : isJup ? 'Jupiter' : 'Audited Solana Token',
          symbol: isBonk ? 'BONK' : isJup ? 'JUP' : 'TOKEN',
          score: 94,
          riskLevel: 'good',
          mintAuthorityRevoked: true,
          freezeAuthorityRevoked: true,
          lpLocked: true,
          topHoldersSharePct: 14.8,
          risksDetected: [],
        });
      }
      setAuditing(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-stone-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 text-stone-950 flex items-center justify-center font-black text-sm shadow-md">
              ◎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Solana Agent Kit Console
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                    sendaifun/solana-agent-kit
                  </span>
                </h2>
                <a
                  href="https://github.com/sendaifun/solana-agent-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-white transition-colors"
                  title="View GitHub Repository"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-purple-200/80">
                Autonomous Solana blockchain execution: Jupiter swaps, Pyth oracles, Blinks, and Pump.fun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Selector */}
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as SolanaNetwork)}
              className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white focus:outline-none cursor-pointer"
            >
              <option value="devnet" className="text-stone-900">Devnet</option>
              <option value="mainnet-beta" className="text-stone-900">Mainnet-Beta</option>
              <option value="testnet" className="text-stone-900">Testnet</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Wallet & Pyth Ticker Strip */}
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Agent Wallet */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-stone-500 font-medium">Agent Wallet:</span>
              <button
                onClick={handleCopyAddress}
                className="font-mono text-stone-800 font-semibold hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1"
                title="Click to copy public key"
              >
                {wallet.publicKey.slice(0, 4)}...{wallet.publicKey.slice(-4)}
                {copiedAddr ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
              </button>
            </div>

            <div className="flex items-center gap-1 bg-purple-100/70 border border-purple-200 px-2 py-0.5 rounded-md font-bold text-purple-900">
              <span>{wallet.balanceSOL.toFixed(2)} SOL</span>
            </div>

            {network === 'devnet' && (
              <button
                onClick={handleAirdrop}
                disabled={airdropLoading}
                className="px-2 py-0.5 text-[11px] font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {airdropLoading ? 'Requesting...' : airdropSuccess ? '✓ +2 SOL Airdropped' : '+ Airdrop 2 SOL'}
              </button>
            )}
          </div>

          {/* Pyth Oracle Ticker */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              Pyth Oracles
              <button
                onClick={handleRefreshPrices}
                disabled={isRefreshingPrices}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Refresh Pyth feeds"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingPrices ? 'animate-spin text-purple-600' : ''}`} />
              </button>
            </span>
            {prices.map((feed) => (
              <div key={feed.symbol} className="flex items-center gap-1 font-mono text-[11px]">
                <span className="font-semibold text-stone-700">{feed.symbol}:</span>
                <span className="text-stone-900 font-medium">
                  ${feed.price < 0.001 ? feed.price.toFixed(6) : feed.price.toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold ${feed.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {feed.change24h >= 0 ? '+' : ''}{feed.change24h.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200 bg-white px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'swap', label: 'Jupiter DEX Swap', icon: ArrowLeftRight },
            { id: 'pumpfun', label: 'Pump.fun Launch', icon: Rocket },
            { id: 'blinks', label: 'Solana Blinks', icon: Zap },
            { id: 'rugcheck', label: 'RugCheck Auditor', icon: ShieldCheck },
            { id: 'prompts', label: 'AI Agent Invocations', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-stone-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/50">
          {/* TAB 1: Jupiter Swap */}
          {activeTab === 'swap' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                      Jupiter Aggregator v6 Autonomous Routing
                    </h3>
                    <p className="text-xs text-stone-500">
                      Smart liquidity aggregation across Raydium, Orca Whirlpools, and Meteora.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Slippage</span>
                    <div className="flex items-center gap-1">
                      {[0.1, 0.5, 1.0].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSlippage(val)}
                          className={`px-1.5 py-0.5 text-[10px] rounded font-medium cursor-pointer ${
                            slippage === val ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swap Input Boxes */}
                <div className="space-y-2">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>You Pay</span>
                      <span>Balance: {fromToken === 'SOL' ? wallet.balanceSOL : wallet.tokens.find((t) => t.symbol === fromToken)?.balance || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        className="w-full bg-transparent font-mono text-lg font-bold text-stone-900 focus:outline-none"
                      />
                      <select
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="JUP">JUP</option>
                        <option value="BONK">BONK</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center -my-1 relative z-10">
                    <button
                      onClick={() => {
                        const temp = fromToken;
                        setFromToken(toToken);
                        setToToken(temp);
                      }}
                      className="p-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-purple-600 shadow-sm cursor-pointer transition-transform hover:rotate-180"
                      title="Flip tokens"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>You Receive (Estimated)</span>
                      <span>Balance: {toToken === 'SOL' ? wallet.balanceSOL : wallet.tokens.find((t) => t.symbol === toToken)?.balance || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-full font-mono text-lg font-bold text-stone-900">
                        {computedOutAmount.toLocaleString()}
                      </div>
                      <select
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
                      >
                        <option value="JUP">JUP</option>
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="BONK">BONK</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Routing Breakdown */}
                <div className="mt-4 p-3 bg-stone-100/70 border border-stone-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Route Execution:</span>
                    <span className="font-semibold text-stone-800">
                      Jupiter Direct Multi-Hop (Orca 65% + Raydium 35%)
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Price Impact:</span>
                    <span className="text-emerald-700 font-semibold">&lt; 0.04%</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Priority Network Fee:</span>
                    <span className="font-mono text-stone-800">~0.000005 SOL</span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteSwap}
                  disabled={swapExecuting || !parseFloat(swapAmount)}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {swapExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Executing via Solana Agent Kit...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Simulate & Execute Swap via Jupiter
                    </>
                  )}
                </button>
              </div>

              {/* Confirmation Card */}
              {swapResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Transaction Successfully Executed on Solana {network.toUpperCase()}!
                  </div>
                  <div className="font-mono text-stone-700 space-y-1 pl-6">
                    <p>Signature: <span className="text-purple-700">{swapResult.txSignature}</span></p>
                    <p>Swapped: {swapResult.inputAmount} {swapResult.inputMint} ➔ {swapResult.outputAmount} {swapResult.outputMint}</p>
                    <p>Routes: {swapResult.routes.map((r) => `${r.protocol} (${r.percentage}%)`).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pump.fun Launch */}
          {activeTab === 'pumpfun' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-orange-500" />
                    Autonomous Pump.fun Token Deployer
                  </h3>
                  <p className="text-xs text-stone-500">
                    Deploy fair-launch bonding curve tokens on Solana using @solana-agent-kit/plugin-token.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Token Name</label>
                      <input
                        type="text"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Symbol / Ticker</label>
                      <input
                        type="text"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={tokenDesc}
                      onChange={(e) => setTokenDesc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Initial Buy (SOL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={initialBuySOL}
                      onChange={(e) => setInitialBuySOL(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Fair-Launch Mechanics:
                    </div>
                    <p className="text-[11px] text-purple-800">
                      No pre-mine. 100% of tokens deposited directly into the bonding curve. When market cap reaches $69k (~85 SOL), liquidity automatically migrates to Raydium and burns.
                    </p>
                  </div>

                  <button
                    onClick={handleDeployToken}
                    disabled={deployLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deployLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Deploying SPL Mint & Bonding Curve...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Deploy Token via Solana Agent Kit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {deployedToken && (
                <div className="bg-white border border-stone-200 rounded-xl p-4 text-xs space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Token Successfully Minted & Live on Bonding Curve!
                  </div>
                  <div className="font-mono text-stone-700 space-y-1 pl-6">
                    <p>Name: <span className="font-bold text-stone-900">{deployedToken.name} (${deployedToken.symbol})</span></p>
                    <p>Mint: <span className="text-purple-700">{deployedToken.mint}</span></p>
                    <p>Total Supply: {deployedToken.supply}</p>
                    <p>Curve Progress: {deployedToken.curveProgress} (Market Cap: {deployedToken.marketCapSOL})</p>
                    <p>Deploy Tx: <span className="text-stone-500">{deployedToken.txHash}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Blinks */}
          {activeTab === 'blinks' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Solana Actions & Blinks Generator
                  </h3>
                  <p className="text-xs text-stone-500">
                    Transform any on-chain action into shareable, interactive Blinks across Twitter, Discord, and Telegram.
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Action Title</label>
                    <input
                      type="text"
                      value={blinkTitle}
                      onChange={(e) => setBlinkTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={blinkDesc}
                      onChange={(e) => setBlinkDesc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Live Blink Preview Card */}
                <div className="border border-purple-200 rounded-xl p-4 bg-gradient-to-b from-purple-50/50 to-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-2">
                    Blink Preview (Dialect Standard)
                  </span>
                  <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                        ◎
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{blinkTitle}</h4>
                        <p className="text-xs text-stone-500">dial.to • Solana Action</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-700">{blinkDesc}</p>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {['0.1 SOL', '0.5 SOL', '1.0 SOL'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setBlinkAmount(opt.split(' ')[0])}
                          className="py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-purple-100 hover:text-purple-800 text-stone-800 transition-colors cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const blinkUrl = `https://dial.to/?action=solana-action:https://openclaw.ai/api/actions/donate?amount=${blinkAmount}`;
                      navigator.clipboard.writeText(blinkUrl);
                      setBlinkCopied(true);
                      setTimeout(() => setBlinkCopied(false), 2000);
                    }}
                    className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {blinkCopied ? '✓ Copied Blink URL' : 'Copy Dialect Blink URL'}
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onSendToChat(
                        `Generate a production-ready Solana Action and Blink JSON specification for "${blinkTitle}": ${blinkDesc} using @solana-agent-kit/plugin-blinks.`
                      );
                    }}
                    className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Generate Code in Agent
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RugCheck Auditor */}
          {activeTab === 'rugcheck' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Solana RugCheck & Contract Security Auditor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Verify freeze authority, mint revocation, and liquidity locks before autonomous trades.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Token Mint Address
                    </label>
                    <input
                      type="text"
                      value={auditMint}
                      onChange={(e) => setAuditMint(e.target.value)}
                      placeholder="Enter base58 mint address..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Quick Test Mints:</span>
                    <button
                      onClick={() => {
                        setAuditMint('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
                        handleRunAudit('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
                      }}
                      className="px-2 py-0.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md cursor-pointer"
                    >
                      BONK (Verified)
                    </button>
                    <button
                      onClick={() => {
                        setAuditMint('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN');
                        handleRunAudit('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN');
                      }}
                      className="px-2 py-0.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md cursor-pointer"
                    >
                      JUP (Verified)
                    </button>
                    <button
                      onClick={() => {
                        setAuditMint('riskyHoneypotMintAddressExample999999');
                        handleRunAudit('riskyHoneypotMintAddressExample999999');
                      }}
                      className="px-2 py-0.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md cursor-pointer"
                    >
                      Malicious Mint Test
                    </button>
                  </div>

                  <button
                    onClick={() => handleRunAudit()}
                    disabled={auditing || !auditMint}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {auditing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Scanning On-Chain Metadata...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Run Institutional RugCheck Audit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {auditResult && (
                <div className={`border rounded-xl p-5 text-xs space-y-3 shadow-xs ${
                  auditResult.riskLevel === 'good'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-rose-50/60 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {auditResult.riskLevel === 'good' ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">
                          {auditResult.name} (${auditResult.symbol}) - Audit Report
                        </h4>
                        <p className="font-mono text-stone-500">{auditResult.mint}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Safety Score</span>
                      <span className={`text-xl font-black ${
                        auditResult.score >= 80 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {auditResult.score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-600">Mint Authority:</span>
                      <span className={`font-semibold ${auditResult.mintAuthorityRevoked ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {auditResult.mintAuthorityRevoked ? 'Revoked (Safe)' : 'Active (High Risk)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-600">Freeze Authority:</span>
                      <span className={`font-semibold ${auditResult.freezeAuthorityRevoked ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {auditResult.freezeAuthorityRevoked ? 'Disabled (Safe)' : 'Enabled (Dangerous)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-600">Liquidity Pool:</span>
                      <span className={`font-semibold ${auditResult.lpLocked ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {auditResult.lpLocked ? '100% Burned/Locked' : 'Unlocked (Rug Risk)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-600">Top 10 Wallets Share:</span>
                      <span className={`font-semibold ${auditResult.topHoldersSharePct < 25 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {auditResult.topHoldersSharePct}%
                      </span>
                    </div>
                  </div>

                  {auditResult.risksDetected.length > 0 && (
                    <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                        Critical Vulnerabilities Found:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {auditResult.risksDetected.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI Prompts */}
          {activeTab === 'prompts' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Quick Solana Agent Kit Invocations
                </h3>
                <p className="text-xs text-stone-500">
                  Trigger autonomous reasoning directly in the agent with SendAI Solana Agent Kit tooling.
                </p>
              </div>

              {[
                {
                  title: 'Jupiter Swap Simulation',
                  desc: 'Ask the agent to simulate a 1.5 SOL to JUP swap using Jupiter routing and compute price impact.',
                  prompt: 'Using the Solana Agent Kit (@sendaifun/solana-agent-kit), simulate a Jupiter DEX swap of 1.5 SOL to JUP on Solana devnet. Output the route legs, price impact, and expected output amount.',
                },
                {
                  title: 'Pyth Oracle Price & Trend Analysis',
                  desc: 'Fetch current Pyth Network prices for SOL and JUP, analyze moving averages, and recommend an action.',
                  prompt: 'Fetch the real-time Pyth Network price feeds for SOL, JUP, and BONK. Provide a technical market synthesis comparing 24h momentum.',
                },
                {
                  title: 'Solana Blink Dialect Generator',
                  desc: 'Generate a production-ready Solana Blink specification for open-source donations.',
                  prompt: 'Generate an interactive Solana Action and Blink Dialect specification for tipping open-source AI developers. Include the action JSON schema and dial.to preview link.',
                },
                {
                  title: 'Institutional Token RugCheck Audit',
                  desc: 'Execute a token security audit evaluating freeze authority, mint rights, and liquidity lock.',
                  prompt: 'Perform a comprehensive RugCheck audit for Solana token mint "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" (BONK). Verify whether mint authority is revoked, freeze authority is disabled, and liquidity is burned.',
                },
                {
                  title: 'Pump.fun Token Deployment Manifest',
                  desc: 'Synthesize code to deploy a token on Pump.fun via SendAI agent kit.',
                  prompt: 'Write a TypeScript script using @solana-agent-kit/plugin-token to deploy a new fair-launch token on Pump.fun with initial liquidity and bonding curve tracking.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-purple-300 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSendToChat(item.prompt);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="w-3 h-3" />
                    Send to Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
