import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Globe,
  Sparkles,
  Brain,
  Zap,
  CheckSquare,
  Flame,
  Paperclip,
  FileText,
  X,
  TrendingUp,
  Coins,
  CornerDownLeft,
  Command,
  Shield,
} from 'lucide-react';
import { AgentMode } from '../types';
import { isSpeechRecognitionSupported } from '../utils/speech';

interface SolanaPriceSummary {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

interface ChatInputProps {
  onSendMessage: (text: string, mode: AgentMode, enableWebSearch: boolean) => void;
  onStop: () => void;
  isLoading: boolean;
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStop,
  isLoading,
  currentMode,
  onModeChange,
}) => {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [solanaPrices, setSolanaPrices] = useState<SolanaPriceSummary[]>([
    { symbol: 'SOL', name: 'Solana', price: 154.2, change24h: 4.82 },
    { symbol: 'JUP', name: 'Jupiter', price: 0.89, change24h: -1.45 },
    { symbol: 'BONK', name: 'Bonk', price: 0.0000214, change24h: 8.92 },
    { symbol: 'RAY', name: 'Raydium', price: 2.15, change24h: 3.12 },
  ]);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Poll live Solana prices
  useEffect(() => {
    let mounted = true;
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/solana/prices');
        if (res.ok && mounted) {
          const data = await res.json();
          if (Array.isArray(data.prices)) {
            setSolanaPrices(data.prices.slice(0, 4));
          }
        }
      } catch (e) {
        // silent fail
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mode menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 44), 190)}px`;
    }
  }, [text]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds limit. Please select a text or code document under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: content,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Speech Recognition
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Voice transcription is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to initiate dictation:', e);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && !attachedFile) || isLoading) return;
    let fullMessage = text.trim();
    if (attachedFile) {
      const fileHeader = `[Archival Inscription: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\n`;
      fullMessage = `${fileHeader}${fullMessage || 'Perform a rigorous, exhaustive analysis of the attached manuscript.'}`;
    }
    onSendMessage(fullMessage, currentMode, enableWebSearch);
    setText('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const modesList: { mode: AgentMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { mode: 'ultra', label: 'Max Power', desc: 'Unrestricted reasoning & full code', icon: <Flame className="w-3.5 h-3.5 text-amber-600" /> },
    { mode: 'thinking', label: 'Deep Reasoning', desc: 'High Thinking budget & proof synthesis', icon: <Brain className="w-3.5 h-3.5 text-indigo-600" /> },
    { mode: 'fast', label: 'Flash Speed', desc: 'Low-latency conversational answers', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    { mode: 'research', label: 'Web Oracle', desc: 'Grounding with live web sources', icon: <Globe className="w-3.5 h-3.5 text-blue-600" /> },
    { mode: 'task', label: 'Autonomous Task', desc: 'Multi-step breakdown & execution', icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> },
    { mode: 'auto', label: 'Adaptive Orchestrator', desc: 'Auto-selects optimal neural route', icon: <Sparkles className="w-3.5 h-3.5 text-stone-600" /> },
  ];

  const starterPrompts = [
    { label: 'Max Power Breakdown', query: 'Conduct an exhaustive, unrestricted mathematical and algorithmic breakdown of Byzantine fault-tolerant consensus mechanisms with complete TypeScript implementation.', mode: 'ultra' as AgentMode },
    { label: 'Metaphysics of Identity', query: 'Evaluate the Ship of Theseus paradox under continuous temporal replacement, contrasting Mereological Essentialism with 4-Dimensional Worm Theory.', mode: 'thinking' as AgentMode },
    { label: 'Global Fusion Benchmarks', query: 'Synthesize the state of commercial fusion reactor milestones achieved across 2025-2026, comparing stellarators and spherical tokamaks.', mode: 'research' as AgentMode },
    { label: 'Disaster Protocol Plan', query: 'Formulate an enterprise-grade, zero-trust cloud disaster recovery architecture with 15-minute RPO/RTO SLAs.', mode: 'task' as AgentMode },
  ];

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="sticky bottom-0 z-20 bg-gradient-to-t from-[#f9f3d7] via-[#f9f3d7]/95 to-transparent pt-5 pb-5 sm:pb-7 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Hidden File Input for attachments */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".txt,.js,.ts,.tsx,.jsx,.json,.csv,.md,.py,.html,.css,.sql,.yaml,.yml,.xml"
          className="hidden"
        />

        {/* Classic Editorial Starter Prompts */}
        {!text && !attachedFile && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            <span
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
              className="text-[10px] tracking-[0.18em] uppercase text-stone-400 font-semibold shrink-0 pl-1"
            >
              Inscriptions:
            </span>
            {starterPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(p.query);
                  onModeChange(p.mode);
                  if (p.mode === 'research' || p.mode === 'ultra') setEnableWebSearch(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs whitespace-nowrap transition-all cursor-pointer font-serif italic ${
                  p.mode === 'ultra'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-2xs'
                    : 'bg-white/80 hover:bg-stone-50 border-stone-200/90 text-stone-700 hover:text-stone-900 shadow-2xs hover:border-stone-300'
                }`}
              >
                {p.mode === 'ultra' && <Flame className="w-3 h-3 text-amber-600 fill-amber-500 not-italic" />}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* The Exclusive Classic Console Chassis */}
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-stone-300/80 shadow-[0_16px_40px_-8px_rgba(28,25,23,0.12),0_2px_8px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/5 transition-all focus-within:border-stone-800 focus-within:ring-1 focus-within:ring-stone-900/15">
          {/* Classic Crest / Executive Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100/90 bg-stone-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.18em] uppercase text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
              <span
                style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                className="text-stone-900 font-bold tracking-[0.2em] text-[11px]"
              >
                OPUS CLAW
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-stone-600 hidden sm:inline font-sans text-[10px] tracking-widest">
                DIRECTIVE CONSOLE
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-stone-400 font-mono text-[9px]">V1.4</span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono">
              {text.trim() && (
                <span className="text-stone-400 hidden sm:inline font-mono text-[10px]">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} • {text.length} chars
                </span>
              )}
              <div className="flex items-center gap-1.5 bg-white border border-stone-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-stone-700 tracking-wider">
                  ORACLE READY
                </span>
              </div>
            </div>
          </div>

          {/* Solana Live Price Ribbon (Classic Financial Ticker) */}
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-stone-100/80 bg-stone-50/30 overflow-x-auto scrollbar-none text-[11px]">
            <span
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
              className="font-bold text-stone-700 text-[10px] tracking-[0.14em] uppercase flex items-center gap-1 shrink-0"
            >
              <Coins className="w-3 h-3 text-stone-700" />
              SOLANA ORACLE:
            </span>
            <div className="flex items-center gap-1.5">
              {solanaPrices.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => {
                    setText(`What is the live price action, 24h momentum, and key support levels for ${item.name} (${item.symbol}) right now?`);
                    onModeChange('fast');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 text-stone-800 transition-all cursor-pointer shrink-0 font-mono text-[11px] shadow-2xs"
                  title={`Click to ask agent about ${item.symbol} live price`}
                >
                  <span className="font-semibold text-stone-900">{item.symbol}</span>
                  <span className="text-stone-600">
                    ${item.symbol === 'BONK'
                      ? item.price.toFixed(7)
                      : item.price.toFixed(item.price < 1 ? 4 : 2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      item.change24h >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.change24h >= 0 ? '+' : ''}
                    {item.change24h}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Archival Attachment Tag */}
          {attachedFile && (
            <div className="mx-4 mt-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-amber-950 truncate">
                <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="font-semibold tracking-tight truncate">{attachedFile.name}</span>
                <span className="text-[11px] text-amber-700/80 font-mono">
                  ({(attachedFile.content.length / 1024).toFixed(1)} KB loaded)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                title="Remove attached file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Textarea Inscription Field */}
          <textarea
            id="chat-textarea"
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentMode === 'ultra'
                ? 'Inscribe your directive for Unrestricted Max Power processing...'
                : currentMode === 'thinking'
                ? 'Inscribe an analytical inquiry requiring high-depth mathematical or philosophical reasoning...'
                : currentMode === 'research'
                ? 'Inscribe a subject for live web oracle synthesis and citation...'
                : currentMode === 'task'
                ? 'Inscribe an autonomous mission to formulate and execute...'
                : 'Inscribe a directive, inquiry, or autonomous task...'
            }
            className="w-full resize-none px-4.5 pt-3.5 pb-2 text-[15px] sm:text-[15px] text-stone-900 placeholder:text-stone-400 placeholder:italic placeholder:font-serif focus:outline-none bg-transparent leading-relaxed tracking-tight"
          />

          {/* Bottom Instrumentation Deck */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-3.5 py-2.5 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl gap-2">
            <div className="flex items-center gap-1.5 relative" ref={modeMenuRef}>
              {/* Luxury Mode Dial Badge */}
              <button
                type="button"
                id="mode-selector-badge"
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold tracking-wide uppercase transition-all cursor-pointer shadow-2xs ${
                  currentMode === 'ultra'
                    ? 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-400'
                }`}
                title="Select execution mode"
              >
                {currentMode === 'ultra' && <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />}
                {currentMode === 'fast' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                {currentMode === 'thinking' && <Brain className="w-3.5 h-3.5 text-indigo-600" />}
                {currentMode === 'auto' && <Sparkles className="w-3.5 h-3.5 text-stone-600" />}
                {currentMode === 'task' && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                {currentMode === 'research' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                <span className="font-sans">
                  {currentMode === 'ultra' ? 'Max Power' : currentMode}
                </span>
                <span className="text-[10px] text-stone-400">▾</span>
              </button>

              {/* Mode Dropdown Menu */}
              {isModeMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-300 shadow-[0_12px_32px_rgba(28,25,23,0.15)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div
                    style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                    className="px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase text-stone-400 font-semibold border-b border-stone-100 mb-1"
                  >
                    Select Execution Tier
                  </div>
                  {modesList.map((m) => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => {
                        onModeChange(m.mode);
                        setIsModeMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        currentMode === m.mode
                          ? 'bg-stone-100 text-stone-900 font-semibold'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">{m.icon}</div>
                      <div>
                        <div className="text-xs font-semibold">{m.label}</div>
                        <div className="text-[11px] text-stone-500 font-normal leading-snug">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Attach File Button */}
              <button
                type="button"
                id="attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Attach manuscript, code, JSON, CSV, or markdown file"
              >
                <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Attach</span>
              </button>

              {/* Web Oracle Toggle */}
              <button
                type="button"
                id="web-search-toggle"
                onClick={() => setEnableWebSearch(!enableWebSearch)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  enableWebSearch || currentMode === 'research' || currentMode === 'ultra'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title="Toggle Google Search Grounding for live web citations"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web Oracle</span>
              </button>

              {/* Dictation / Speech-to-Text */}
              <button
                type="button"
                id="voice-mic-btn"
                onClick={toggleListening}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title={isListening ? 'Listening... click to finalize' : 'Voice Dictation'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Execution Instrument */}
            <div className="flex items-center gap-2 ml-auto">
              {isLoading ? (
                <button
                  type="button"
                  id="stop-generation-btn"
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 active:scale-[0.98] cursor-pointer shadow-sm transition-all"
                  title="Halt current generation"
                >
                  <Square className="w-3 h-3 fill-stone-100" />
                  <span>Halt</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="send-message-btn"
                  onClick={handleSubmit}
                  disabled={!text.trim() && !attachedFile}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                    text.trim() || attachedFile
                      ? 'bg-stone-950 text-white hover:bg-black active:scale-[0.98] shadow-[0_2px_10px_rgba(28,25,23,0.2)] border border-stone-800 cursor-pointer'
                      : 'bg-stone-200 text-stone-400 border border-transparent cursor-not-allowed'
                  }`}
                  title="Dispatch directive to autonomous agent"
                >
                  <span>Dispatch</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timeless Sub-footer Inscription */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 px-2 font-mono">
          <span className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-stone-400" />
            <span>Return to dispatch • Shift + Return for newline</span>
          </span>
          <span className="hidden sm:flex items-center gap-1 text-stone-400">
            <Shield className="w-3 h-3 text-stone-400" />
            <span>Direct Autonomous Stream</span>
          </span>
        </div>
      </div>
    </div>
  );
};
