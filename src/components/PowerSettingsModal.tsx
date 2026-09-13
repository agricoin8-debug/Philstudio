import React from 'react';
import {
  Zap,
  Sliders,
  X,
  Flame,
  ShieldAlert,
  Brain,
  Globe,
  RotateCcw,
  Check,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PowerSettings } from '../types';

interface PowerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PowerSettings;
  onSaveSettings: (settings: PowerSettings) => void;
}

export const PowerSettingsModal: React.FC<PowerSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = React.useState<PowerSettings>(settings);
  const [isSavedNotice, setIsSavedNotice] = React.useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const presets = [
    {
      title: '🔥 Unrestricted Polymath',
      desc: 'Deepest technical answers, exhaustive proofs, complete algorithms without placeholders.',
      prompt:
        'Act with maximum intellectual capability. Provide exhaustive technical depth, complete first-principles explanations, rigorous logic, and fully written production code without omissions or placeholders.',
    },
    {
      title: '💻 Elite Principal Architect',
      desc: 'Enterprise distributed systems, typed code, security audits, and zero-compromise solutions.',
      prompt:
        'Act as an Elite Principal Software Architect. Prioritize robust type safety, comprehensive error handling, modular system design, performance benchmarks, and end-to-end executable implementations.',
    },
    {
      title: '🔬 Senior Empirical Researcher',
      desc: 'Methodological rigor, verified citations, statistical analysis, and objective truth.',
      prompt:
        'Act as a Senior Scientific Researcher. Evaluate all premises rigorously, cite empirical evidence, provide nuanced counter-arguments, and explain mechanics at the fundamental level.',
    },
    {
      title: '⚡ Direct Solver (No Fluff)',
      desc: 'Raw unfiltered facts, minimal small talk, immediate executable code and answers.',
      prompt:
        'Be extremely direct and concise in conversational preamble. Jump immediately to the solution with complete code, commands, or mathematical calculations. Omit unnecessary conversational filler.',
    },
  ];

  const handleApply = () => {
    onSaveSettings(localSettings);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 500);
  };

  const handleReset = () => {
    const defaults: PowerSettings = {
      unrestrictedDepth: true,
      historyLimit: 40,
      customSystemPrompt: '',
      forceSearch: false,
      temperature: 0.7,
    };
    setLocalSettings(defaults);
    onSaveSettings(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 fill-amber-100 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">Power Matrix & Unrestricted Controls</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  POWER LEVEL: MAX
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Remove cognitive restrictions, expand context horizons, and customize system directives.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-stone-800">
          {/* Section 1: Unrestricted Depth Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-stone-900">Unrestricted Depth & Zero Placeholders</h3>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Instructs the agent to provide exhaustive, complete solutions without artificial brevity, lazy code stubs, or refusal disclaimers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={localSettings.unrestrictedDepth}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, unrestrictedDepth: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Section 2: Context Memory Horizon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-600" />
                Conversation Memory Depth (Context Retention)
              </label>
              <span className="font-mono text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {localSettings.historyLimit} messages
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={localSettings.historyLimit}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, historyLimit: parseInt(e.target.value, 10) })
              }
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>Standard (10 msgs)</span>
              <span>Enhanced (30 msgs)</span>
              <span>Ultra Long Memory (60 msgs)</span>
            </div>
          </div>

          {/* Section 3: Force Web Search Grounding */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-stone-900">Always Ground with Google Search</h3>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Automatically execute real-time web search grounding on every single query, ensuring verified factual citations for all answers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={localSettings.forceSearch}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, forceSearch: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Section 4: Reasoning Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                <Cpu className="w-4 h-4 text-stone-600" />
                Reasoning Temperature (Strict Logic vs Creative Synthesis)
              </label>
              <span className="font-mono text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                {localSettings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>0.1 (Deterministic / Math & Code)</span>
              <span>0.7 (Balanced Power)</span>
              <span>1.0 (High Creativity)</span>
            </div>
          </div>

          {/* Section 5: Custom System Directive / Persona */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-stone-600" />
                Custom Power Directive (System Prompt Injection)
              </span>
              <span className="text-stone-400 font-normal text-[11px]">Optional</span>
            </label>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, customSystemPrompt: p.prompt })}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-xs text-stone-800 group-hover:text-amber-900">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{p.desc}</div>
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={localSettings.customSystemPrompt}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, customSystemPrompt: e.target.value })
              }
              placeholder="e.g. Always provide complete, unit-tested TypeScript code. Never use placeholder comments. Analyze trade-offs rigorously..."
              className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 focus:bg-white text-stone-900 placeholder:text-stone-400 transition-all font-mono"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isSavedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
              <span>{isSavedNotice ? 'Saved!' : 'Apply Power Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
