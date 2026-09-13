import React from 'react';
import {
  Bot,
  Zap,
  Brain,
  Globe,
  CheckSquare,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  ListTodo,
  Flame,
  Sliders,
  Cpu,
  Radio,
  Package,
  Coins,
  Activity,
} from 'lucide-react';
import { AgentMode } from '../types';

interface HeaderProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  onClearChat: () => void;
  onOpenTaskPlanner: () => void;
  sourcesCount: number;
  onOpenSources: () => void;
  onOpenPowerSettings: () => void;
  isUnrestrictedActive: boolean;
  skillsCount: number;
  onOpenSkills: () => void;
  memoriesCount: number;
  onOpenMemory: () => void;
  channelsCount: number;
  onOpenGateway: () => void;
  onOpenClawHub: () => void;
  onOpenSolana: () => void;
  showLatencyChart?: boolean;
  onToggleLatencyChart?: () => void;
  showSolanaPriceChart?: boolean;
  onToggleSolanaPriceChart?: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onClearChat,
  onOpenTaskPlanner,
  sourcesCount,
  onOpenSources,
  onOpenPowerSettings,
  isUnrestrictedActive,
  skillsCount,
  onOpenSkills,
  memoriesCount,
  onOpenMemory,
  channelsCount,
  onOpenGateway,
  onOpenClawHub,
  onOpenSolana,
  showLatencyChart,
  onToggleLatencyChart,
  showSolanaPriceChart,
  onToggleSolanaPriceChart,
  autoSpeak,
  onToggleAutoSpeak,
}) => {
  const modes: { id: AgentMode; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'auto', label: 'Auto Route', icon: Sparkles, desc: 'Dynamic smart router' },
    { id: 'ultra', label: 'Max Power', icon: Flame, desc: 'Unrestricted reasoning + live search + full depth' },
    { id: 'thinking', label: 'High Thinking', icon: Brain, desc: 'Groq deep reasoning' },
    { id: 'fast', label: 'Groq Fast', icon: Zap, desc: 'Ultra low-latency responses' },
    { id: 'research', label: 'Web Research', icon: Globe, desc: 'Google Search grounding' },
    { id: 'task', label: 'Do Task', icon: CheckSquare, desc: 'Autonomous execution' },
  ];

  return (
    <header className="border-b border-black/10 bg-[#fffdf4]/85 backdrop-blur-xl sticky top-0 z-30 px-4 py-3.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#20221d] text-[#f9df4f] flex items-center justify-center shadow-[4px_4px_0_#e9c928] rotate-[-3deg]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-stone-900">
                Autonomous AI Agent
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <span>Low-Latency (Groq)</span>
              <span>•</span>
              <span>High Thinking (Groq)</span>
              <span>•</span>
              <span>Live Search</span>
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`mode-btn-${m.id}`}
                onClick={() => onModeChange(m.id)}
                title={m.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap justify-end">
          {/* ClawHub Skill Marketplace (openclaw/clawhub) */}
          <button
            id="open-clawhub-btn"
            onClick={onOpenClawHub}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200/80 hover:bg-orange-100 transition-colors cursor-pointer"
            title="ClawHub Public Skill Marketplace (openclaw/clawhub)"
          >
            <Package className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">ClawHub</span>
          </button>

          {/* Solana Agent Kit Console (sendaifun/solana-agent-kit) */}
          <button
            id="open-solana-btn"
            onClick={onOpenSolana}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100 text-purple-900 border border-purple-300 hover:border-purple-400 hover:shadow-2xs transition-all cursor-pointer"
            title="Solana Agent Kit Console (sendaifun/solana-agent-kit)"
          >
            <span className="text-[13px] leading-none text-purple-700">◎</span>
            <span className="hidden sm:inline">Solana Kit</span>
          </button>

          {/* Solana Live Price Chart Toggle */}
          {onToggleSolanaPriceChart && (
            <button
              id="toggle-solana-chart-btn"
              onClick={onToggleSolanaPriceChart}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showSolanaPriceChart
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title="Toggle Solana Live Price & Oracle Chart (Recharts)"
            >
              <Coins className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Price Chart</span>
            </button>
          )}

          {/* OpenClaw Skill Registry */}
          <button
            id="open-skills-btn"
            onClick={onOpenSkills}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            title="OpenClaw Skill Registry"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Skills</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              {skillsCount}
            </span>
          </button>

          {/* OpenClaw Memory Vault */}
          <button
            id="open-memory-btn"
            onClick={onOpenMemory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            title="OpenClaw Long-Term Memory Vault"
          >
            <Brain className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden sm:inline">Memory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800">
              {memoriesCount}
            </span>
          </button>

          {/* OpenClaw Multi-Channel Gateway */}
          <button
            id="open-gateway-btn"
            onClick={onOpenGateway}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            title="OpenClaw Multi-Platform Channel Gateway"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Gateway</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {channelsCount}
            </span>
          </button>

          {/* Recharts Latency Performance Metrics Toggle */}
          {onToggleLatencyChart && (
            <button
              id="toggle-latency-metrics-btn"
              onClick={onToggleLatencyChart}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                showLatencyChart
                  ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title="Toggle Latency Trend & Model Performance Metrics (Recharts)"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Metrics</span>
            </button>
          )}

          {/* Power Matrix & Controls */}
          <button
            id="open-power-settings-btn"
            onClick={onOpenPowerSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isUnrestrictedActive
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title="Open Unrestricted Power Matrix & Directives"
          >
            <Flame className={`w-3.5 h-3.5 ${isUnrestrictedActive ? 'text-amber-600 fill-amber-500' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">Power</span>
          </button>

          <button
            id="open-sources-btn"
            onClick={onOpenSources}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              sourcesCount > 0
                ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
            title="Open Web Research Sources Grid"
          >
            <Globe className={`w-3.5 h-3.5 ${sourcesCount > 0 ? 'text-blue-600' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">Sources</span>
            {sourcesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {sourcesCount}
              </span>
            )}
          </button>

          <button
            id="task-planner-btn"
            onClick={onOpenTaskPlanner}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Open Autonomous Task Planner"
          >
            <ListTodo className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Planner</span>
          </button>

          <button
            id="toggle-speak-btn"
            onClick={onToggleAutoSpeak}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              autoSpeak ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
            title={autoSpeak ? 'Auto Voice Readout: ON' : 'Auto Voice Readout: OFF'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="clear-chat-btn"
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-xs bg-stone-100 text-stone-500 hover:text-rose-600 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
