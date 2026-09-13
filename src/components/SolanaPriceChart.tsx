import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { AgentMode } from '../types';

interface SolanaPriceChartProps {
  onSendToChat: (prompt: string, mode?: AgentMode) => void;
  onOpenSolanaKit?: () => void;
}

interface PricePoint {
  timestamp: number;
  time: string;
  price: number;
  open: number;
}

interface ChartResponse {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  timeframe: string;
  points: PricePoint[];
  source: string;
}

const TOKENS = [
  { symbol: 'SOL', name: 'Solana', icon: '◎' },
  { symbol: 'JUP', name: 'Jupiter', icon: '♃' },
  { symbol: 'BONK', name: 'Bonk', icon: '🐕' },
  { symbol: 'RAY', name: 'Raydium', icon: '⚡' },
  { symbol: 'PYTH', name: 'Pyth', icon: '🔮' },
];

export const SolanaPriceChart: React.FC<SolanaPriceChartProps> = ({
  onSendToChat,
  onOpenSolanaKit,
}) => {
  const [selectedToken, setSelectedToken] = useState<string>('SOL');
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'area' | 'line'>('area');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchChart = useCallback(async (symbol: string, tf: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/solana/chart?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(tf)}`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.warn('Failed to fetch Solana price chart:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(selectedToken, timeframe);
  }, [selectedToken, timeframe, fetchChart]);

  // Periodic live update every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChart(selectedToken, timeframe, true);
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedToken, timeframe, fetchChart]);

  const isPositive = (chartData?.change24h ?? 0) >= 0;

  const formatPrice = (val: number, symbol?: string) => {
    if (!val && val !== 0) return '$0.00';
    if (symbol === 'BONK' || val < 0.001) {
      return `$${val.toFixed(8)}`;
    }
    if (symbol === 'JUP' || symbol === 'PYTH' || val < 10) {
      return `$${val.toFixed(4)}`;
    }
    return `$${val.toFixed(2)}`;
  };

  const handleAskAgentAboutChart = () => {
    if (!chartData) return;
    const prompt = `Analyze the current live market trends and price action for ${chartData.name} (${chartData.symbol}/USD). Current Price: ${formatPrice(chartData.currentPrice, chartData.symbol)}, 24h Change: ${chartData.change24h > 0 ? '+' : ''}${chartData.change24h}%, 24h High: ${formatPrice(chartData.high24h, chartData.symbol)}, 24h Low: ${formatPrice(chartData.low24h, chartData.symbol)}, 24h Volume: ${chartData.volume24h}. Provide an autonomous technical review with key support/resistance levels and Jupiter DEX routing liquidity depth.`;
    onSendToChat(prompt, 'research');
  };

  const handleQuickSwapPrompt = () => {
    if (!chartData) return;
    const prompt = `Simulate an autonomous Jupiter DEX v6 swap on Solana: Swap 1 SOL into ${chartData.symbol} with 0.5% slippage tolerance, factoring in Orca and Raydium liquidity routes.`;
    onSendToChat(prompt, 'fast');
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PricePoint = payload[0].payload;
      const deltaFromOpen = data.open ? ((data.price - data.open) / data.open) * 100 : 0;
      const isPointUp = deltaFromOpen >= 0;

      return (
        <div className="bg-stone-900/95 backdrop-blur-sm text-white p-2.5 rounded-xl shadow-xl border border-stone-700 text-xs min-w-[170px] z-50">
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1 mb-1.5">
            <span className="font-bold text-stone-200">{chartData?.symbol}/USD</span>
            <span className="text-[10px] text-stone-400 font-mono">{data.time}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-[11px]">Price:</span>
              <span className="font-mono font-bold text-sm text-white">
                {formatPrice(data.price, chartData?.symbol)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Period Trend:</span>
              <span className={`font-mono font-semibold ${isPointUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPointUp ? '+' : ''}{deltaFromOpen.toFixed(2)}%
              </span>
            </div>
            <div className="text-[9px] text-stone-400 pt-0.5 flex items-center justify-between">
              <span>Oracle Feed</span>
              <span className="text-purple-300 font-mono">Pyth Benchmark</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-4 sm:mx-6 my-2.5 max-w-4xl lg:mx-auto">
      <div className="border border-purple-200/80 bg-gradient-to-b from-white to-purple-50/20 rounded-2xl shadow-xs overflow-hidden transition-all">
        {/* Header Strip */}
        <div className="px-3.5 py-2.5 bg-white border-b border-purple-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              ◎
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1">
                  Solana Live Price & Oracle Chart
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-900 border border-purple-200">
                  Pyth + CoinGecko
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feed
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                Real-time on-chain pricing with autonomous chat queries and Jupiter DEX execution.
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {chartData && (
              <div className="flex items-baseline gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                <span className="text-xs font-bold text-stone-900 font-mono">
                  {formatPrice(chartData.currentPrice, chartData.symbol)}
                </span>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{chartData.change24h}%
                </span>
              </div>
            )}

            <button
              onClick={() => fetchChart(selectedToken, timeframe)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live oracle price"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand price chart' : 'Collapse price chart'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Chart Content */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 space-y-3">
            {/* Token Selector & Controls Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Asset Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedToken === token.symbol
                        ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{token.icon}</span>
                    <span>{token.symbol}</span>
                  </button>
                ))}
              </div>

              {/* Timeframe & Chart Style */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                  {(['1h', '24h', '7d'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded-md font-medium text-[11px] uppercase transition-all cursor-pointer ${
                        timeframe === tf
                          ? 'bg-white text-stone-900 shadow-2xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px]">
                  <button
                    onClick={() => setChartMode('area')}
                    className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                      chartMode === 'area' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartMode('line')}
                    className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                      chartMode === 'line' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-44 sm:h-52 pt-1 relative">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-500 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                  Streaming live {selectedToken} Pyth price history...
                </div>
              ) : chartData && chartData.points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'area' ? (
                    <AreaChart data={chartData.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="solanaPriceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={isPositive ? '#10b981' : '#f43f5e'}
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor={isPositive ? '#10b981' : '#f43f5e'}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        dy={4}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(v) => {
                          if (selectedToken === 'BONK') return v.toFixed(6);
                          if (v >= 100) return `$${Math.round(v)}`;
                          return `$${v.toFixed(2)}`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {chartData.points[0]?.open && (
                        <ReferenceLine
                          y={chartData.points[0].open}
                          stroke="#9ca3af"
                          strokeDasharray="3 3"
                          label={{
                            value: `Open: ${formatPrice(chartData.points[0].open, chartData.symbol)}`,
                            fill: '#9ca3af',
                            fontSize: 9,
                            position: 'insideBottomRight',
                          }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? '#059669' : '#e11d48'}
                        strokeWidth={2.2}
                        fillOpacity={1}
                        fill="url(#solanaPriceGrad)"
                        activeDot={{ r: 5, fill: isPositive ? '#059669' : '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        dy={4}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(v) => {
                          if (selectedToken === 'BONK') return v.toFixed(6);
                          if (v >= 100) return `$${Math.round(v)}`;
                          return `$${v.toFixed(2)}`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? '#059669' : '#e11d48'}
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 5, fill: isPositive ? '#059669' : '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : null}
            </div>

            {/* Token Key Stats Grid */}
            {chartData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-purple-100 text-xs">
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block">24h High</span>
                  <span className="font-mono font-bold text-stone-800">
                    {formatPrice(chartData.high24h, chartData.symbol)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block">24h Low</span>
                  <span className="font-mono font-bold text-stone-800">
                    {formatPrice(chartData.low24h, chartData.symbol)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block">24h Volume</span>
                  <span className="font-mono font-bold text-stone-800">{chartData.volume24h}</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block">Market Cap</span>
                  <span className="font-mono font-bold text-stone-800">{chartData.marketCap}</span>
                </div>
              </div>
            )}

            {/* Chat Action Footer */}
            <div className="pt-2 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>Updated: {lastRefreshed || 'Live'}</span>
                <span>•</span>
                <span className="text-purple-700 font-medium">Pyth High-Frequency Oracle</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleAskAgentAboutChart}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                  title="Ask Agent to analyze this price trend in chat"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Analyze in Chat</span>
                </button>

                <button
                  onClick={handleQuickSwapPrompt}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold text-[11px] transition-colors cursor-pointer"
                  title="Simulate Jupiter swap in chat"
                >
                  <Zap className="w-3 h-3 text-indigo-600" />
                  <span>Simulate Swap</span>
                </button>

                {onOpenSolanaKit && (
                  <button
                    onClick={onOpenSolanaKit}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] transition-colors cursor-pointer"
                    title="Open Solana Agent Kit console"
                  >
                    <span>◎ Console</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
