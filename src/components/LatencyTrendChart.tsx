import React, { useState, useMemo } from 'react';
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
  Activity,
  Zap,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Info,
  Layers,
} from 'lucide-react';
import { ChatMessage, AgentMode } from '../types';

interface LatencyTrendChartProps {
  messages: ChatMessage[];
  currentMode: AgentMode;
  onSendTestPrompt?: (prompt: string, mode: AgentMode) => void;
}

interface LatencyDataPoint {
  index: number;
  id: string;
  name: string;
  fullPrompt: string;
  latencyMs: number;
  latencySec: number;
  mode: string;
  model: string;
  timeStr: string;
  isSynthetic?: boolean;
}

// Baseline seed data if the user has not generated enough responses yet
const DEFAULT_BASELINE_METRICS: LatencyDataPoint[] = [
  {
    index: 1,
    id: 'seed-1',
    name: 'Task 1: System Init',
    fullPrompt: 'Initialize autonomous agent runtime and verify OpenClaw gateway',
    latencyMs: 340,
    latencySec: 0.34,
    mode: 'fast',
    model: 'gemini-3.1-flash-lite',
    timeStr: 'Boot',
    isSynthetic: true,
  },
  {
    index: 2,
    id: 'seed-2',
    name: 'Task 2: Code Review',
    fullPrompt: 'Audit Solana token mint and verify freeze authority revocation',
    latencyMs: 1220,
    latencySec: 1.22,
    mode: 'auto',
    model: 'gemini-3.1-flash-lite',
    timeStr: 'T-2m',
    isSynthetic: true,
  },
  {
    index: 3,
    id: 'seed-3',
    name: 'Task 3: Web Grounding',
    fullPrompt: 'Fetch live Pyth price feeds and synthesize market volatility',
    latencyMs: 1840,
    latencySec: 1.84,
    mode: 'research',
    model: 'gemini-3.8-flash',
    timeStr: 'T-1m',
    isSynthetic: true,
  },
  {
    index: 4,
    id: 'seed-4',
    name: 'Task 4: High Reasoning',
    fullPrompt: 'Autonomous mathematical proof and deep algorithm decomposition',
    latencyMs: 3150,
    latencySec: 3.15,
    mode: 'thinking',
    model: 'gemini-3.1-pro-preview',
    timeStr: 'Now',
    isSynthetic: true,
  },
];

export const LatencyTrendChart: React.FC<LatencyTrendChartProps> = ({
  messages,
  currentMode,
  onSendTestPrompt,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [unit, setUnit] = useState<'ms' | 's'>('ms');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'fast' | 'thinking' | 'ultra'>('all');

  // Extract actual latency data points from conversation history
  const dataPoints: LatencyDataPoint[] = useMemo(() => {
    const points: LatencyDataPoint[] = [];
    let count = 0;

    // Loop through messages and match user prompt with assistant latencyMs
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'assistant' && typeof msg.latencyMs === 'number' && msg.latencyMs > 0) {
        count++;
        // Find preceding user query for contextual label
        let userPrompt = `Task #${count}`;
        for (let j = i - 1; j >= 0; j--) {
          if (messages[j].role === 'user') {
            userPrompt = messages[j].content.trim();
            break;
          }
        }

        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const truncatedLabel = userPrompt.length > 22 ? userPrompt.slice(0, 20) + '...' : userPrompt;

        points.push({
          index: count,
          id: msg.id,
          name: `#${count} ${truncatedLabel}`,
          fullPrompt: userPrompt,
          latencyMs: msg.latencyMs,
          latencySec: Number((msg.latencyMs / 1000).toFixed(2)),
          mode: msg.mode || 'auto',
          model: msg.modelUsed || 'gemini',
          timeStr,
          isSynthetic: false,
        });
      }
    }

    // If fewer than 2 live data points exist, blend or use baseline to ensure a visible trend line
    if (points.length === 0) {
      return DEFAULT_BASELINE_METRICS;
    }
    if (points.length === 1) {
      return [DEFAULT_BASELINE_METRICS[0], ...points.map((p, idx) => ({ ...p, index: idx + 2 }))];
    }

    return points;
  }, [messages]);

  // Filtered dataset according to user selection
  const filteredData = useMemo(() => {
    if (selectedFilter === 'all') return dataPoints;
    return dataPoints.filter((p) => p.mode.toLowerCase().includes(selectedFilter));
  }, [dataPoints, selectedFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const latencies = filteredData.map((d) => d.latencyMs);
    if (latencies.length === 0) {
      return { avg: 0, min: 0, max: 0, latest: 0, total: 0 };
    }
    const sum = latencies.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / latencies.length);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const latest = latencies[latencies.length - 1];
    return { avg, min, max, latest, total: latencies.length };
  }, [filteredData]);

  // Has real conversation points vs baseline
  const hasRealData = useMemo(() => {
    return messages.some((m) => m.role === 'assistant' && typeof m.latencyMs === 'number' && m.latencyMs > 0);
  }, [messages]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: LatencyDataPoint = payload[0].payload;
      const isFast = data.latencyMs < 750;
      const isMedium = data.latencyMs >= 750 && data.latencyMs < 2000;

      return (
        <div className="bg-stone-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-stone-700 text-xs max-w-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
            <span className="font-bold text-stone-200">
              Task #{data.index}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {data.timeStr}
            </span>
          </div>

          <p className="text-stone-300 line-clamp-2 italic font-sans text-[11px]">
            &ldquo;{data.fullPrompt}&rdquo;
          </p>

          <div className="pt-1 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Response Latency:</span>
              <span className={`font-mono font-bold ${
                isFast ? 'text-emerald-400' : isMedium ? 'text-indigo-300' : 'text-amber-400'
              }`}>
                {data.latencyMs.toLocaleString()} ms ({data.latencySec}s)
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Model Engine:</span>
              <span className="font-mono text-purple-300 truncate max-w-[130px]" title={data.model}>
                {data.model}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Execution Mode:</span>
              <span className="capitalize px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-800 text-stone-200">
                {data.mode}
              </span>
            </div>

            {data.isSynthetic && (
              <p className="text-[9px] text-stone-400 pt-0.5">
                * Baseline calibration reference point
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-4 sm:mx-6 my-2.5 max-w-4xl lg:mx-auto">
      <div className="border border-stone-200/90 bg-white rounded-2xl shadow-xs overflow-hidden transition-all">
        {/* Header Ribbon */}
        <div className="px-3.5 py-2.5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1">
                  Latency & Performance Evolution
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Recharts
                </span>
                {!hasRealData && (
                  <span className="hidden sm:inline px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Live Baseline
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                Tracking model inference duration (latencyMs) across task complexity.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-lg shadow-2xs">
              <Clock className="w-3 h-3 text-stone-400" />
              <span className="text-[11px] text-stone-500">Latest:</span>
              <span className={`font-mono font-bold text-[11px] ${
                stats.latest < 800 ? 'text-emerald-700' : stats.latest < 2000 ? 'text-indigo-700' : 'text-amber-700'
              }`}>
                {unit === 'ms' ? `${stats.latest.toLocaleString()} ms` : `${(stats.latest / 1000).toFixed(2)}s`}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-lg shadow-2xs">
              <span className="text-[11px] text-stone-500">Avg:</span>
              <span className="font-mono font-bold text-[11px] text-stone-800">
                {unit === 'ms' ? `${stats.avg.toLocaleString()} ms` : `${(stats.avg / 1000).toFixed(2)}s`}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-lg shadow-2xs">
              <span className="text-[11px] text-stone-500">Fastest:</span>
              <span className="font-mono font-bold text-[11px] text-emerald-600">
                {unit === 'ms' ? `${stats.min.toLocaleString()} ms` : `${(stats.min / 1000).toFixed(2)}s`}
              </span>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand latency chart' : 'Collapse latency chart'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 space-y-3">
            {/* Chart Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                {[
                  { id: 'all', label: 'All Tasks' },
                  { id: 'fast', label: 'Flash-Lite' },
                  { id: 'thinking', label: 'Thinking' },
                  { id: 'ultra', label: 'Max Power' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all cursor-pointer ${
                      selectedFilter === f.id
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Visualization Style & Units */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px]">
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                      chartType === 'area' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Area Trend
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                      chartType === 'line' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Clean Line
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px]">
                  <button
                    onClick={() => setUnit('ms')}
                    className={`px-2 py-0.5 rounded-md font-mono font-medium cursor-pointer ${
                      unit === 'ms' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    ms
                  </button>
                  <button
                    onClick={() => setUnit('s')}
                    className={`px-2 py-0.5 rounded-md font-mono font-medium cursor-pointer ${
                      unit === 's' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    sec
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-44 sm:h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={filteredData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      dy={4}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickFormatter={(val) => (unit === 'ms' ? `${val}ms` : `${(val / 1000).toFixed(1)}s`)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {stats.avg > 0 && (
                      <ReferenceLine
                        y={stats.avg}
                        stroke="#8b5cf6"
                        strokeDasharray="4 4"
                        label={{
                          value: `Avg: ${unit === 'ms' ? stats.avg + 'ms' : (stats.avg / 1000).toFixed(2) + 's'}`,
                          fill: '#7c3aed',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="latencyMs"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#latencyGradient)"
                      activeDot={{ r: 6, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={filteredData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      dy={4}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickFormatter={(val) => (unit === 'ms' ? `${val}ms` : `${(val / 1000).toFixed(1)}s`)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {stats.avg > 0 && (
                      <ReferenceLine
                        y={stats.avg}
                        stroke="#8b5cf6"
                        strokeDasharray="4 4"
                        label={{
                          value: `Avg: ${unit === 'ms' ? stats.avg + 'ms' : (stats.avg / 1000).toFixed(2) + 's'}`,
                          fill: '#7c3aed',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="latencyMs"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 1, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Performance Insights Footer */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  <strong className="text-stone-700">Performance Architecture:</strong> Fast tasks use{' '}
                  <span className="font-mono text-purple-700">gemini-3.1-flash-lite</span> (~200–500ms); complex reasoning uses{' '}
                  <span className="font-mono text-indigo-700">gemini-3.1-pro-preview</span> with deep thinking tokens.
                </span>
              </div>

              {onSendTestPrompt && (
                <div className="flex items-center gap-1">
                  <span className="text-stone-400">Test:</span>
                  <button
                    onClick={() => onSendTestPrompt('Ping test: verify low-latency response', 'fast')}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer transition-colors"
                  >
                    ⚡ Fast (Flash-Lite)
                  </button>
                  <button
                    onClick={() =>
                      onSendTestPrompt(
                        'Analyze the time and space complexity tradeoffs between Merkle Trees and Patricia Tries in blockchain state validation',
                        'thinking'
                      )
                    }
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-medium cursor-pointer transition-colors"
                  >
                    🧠 Deep Thinking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
