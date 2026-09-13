import React, { useState } from 'react';
import { Zap, Brain, Globe, CheckSquare, Sparkles, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { AgentMode } from '../types';

interface AgentStatusBannerProps {
  currentMode: AgentMode;
}

export const AgentStatusBanner: React.FC<AgentStatusBannerProps> = ({ currentMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mx-4 sm:mx-6 my-3 max-w-4xl lg:mx-auto">
      <div className={`border rounded-2xl p-3 sm:p-4 text-xs transition-all ${
        currentMode === 'ultra'
          ? 'border-amber-300 bg-amber-50/60 text-amber-950'
          : 'border-stone-200 bg-stone-50/70 text-stone-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              currentMode === 'ultra' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="font-semibold text-stone-900">
              {currentMode === 'ultra' ? 'Unrestricted Intelligence Stack Active' : 'Autonomous Intelligence Stack'}
            </span>
            <span className="text-stone-400">•</span>
            <span className={`capitalize font-medium ${
              currentMode === 'ultra' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}>
              {currentMode === 'ultra' ? 'Max Power (Unrestricted)' : `${currentMode} Mode`}
            </span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
            title={collapsed ? 'Show capabilities' : 'Hide capabilities'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 mt-3 pt-2.5 border-t border-stone-200/60">
            <div className={`flex items-start gap-2 p-2 rounded-xl border ${
              currentMode === 'ultra'
                ? 'bg-amber-100/70 border-amber-300 shadow-2xs'
                : 'bg-white border-stone-200/60'
            }`}>
              <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
              <div>
                <span className="font-semibold text-stone-900 block">Max Power</span>
                <span className="text-[11px] text-stone-600">Zero limits, deep reasoning & live search</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-stone-200/60">
              <Brain className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">High Thinking</span>
                <span className="text-[11px] text-stone-500">Groq GPT-OSS reasoning layer</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-stone-200/60">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Low-Latency</span>
                <span className="text-[11px] text-stone-500">Groq GPT-OSS for instant answers</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-stone-200/60">
              <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Deep Research</span>
                <span className="text-[11px] text-stone-500">Live Google Search grounding citations</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-stone-200/60">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Autonomous Tasks</span>
                <span className="text-[11px] text-stone-500">Multi-step planning & execution</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
