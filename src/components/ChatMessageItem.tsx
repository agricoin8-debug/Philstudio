import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain,
  Globe,
  Flame,
  Play,
  Terminal,
  FileCode,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface ChatMessageItemProps {
  message: ChatMessage;
  onOpenSourcesGrid?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onOpenSourcesGrid }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showCodeRunner, setShowCodeRunner] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const isUser = message.role === 'user';

  // Extract runnable JS / TS code blocks if present
  const jsCodeBlocks = useMemo(() => {
    if (!message.content) return [];
    const regex = /```(?:javascript|js)\n([\s\S]*?)```/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(message.content)) !== null) {
      if (match[1]?.trim()) {
        matches.push(match[1].trim());
      }
    }
    return matches;
  }, [message.content]);

  const handleRunCode = (codeToRun: string) => {
    setShowCodeRunner(true);
    setExecutionOutput('Executing in client sandbox...');
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        error: (...args: any[]) => logs.push('🔴 ERROR: ' + args.map(String).join(' ')),
        warn: (...args: any[]) => logs.push('🟡 WARN: ' + args.map(String).join(' ')),
        info: (...args: any[]) => logs.push('ℹ️ INFO: ' + args.map(String).join(' ')),
      };

      // Sandboxed execution with intercepted console
      const runFn = new Function('console', `"use strict";\n${codeToRun}`);
      const result = runFn(customConsole);

      let finalOutput = '';
      if (logs.length > 0) {
        finalOutput += `[Console Output]:\n${logs.join('\n')}\n`;
      }
      if (result !== undefined) {
        finalOutput += `[Return Value]:\n${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`;
      }
      if (!finalOutput) {
        finalOutput = 'Executed successfully (no return value or console logs).';
      }
      setExecutionOutput(finalOutput);
    } catch (err: any) {
      setExecutionOutput(`❌ Runtime Error:\n${err.message || String(err)}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message.content, () => {
        setIsSpeaking(false);
      });
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4">
        <div className="flex items-start gap-2.5 max-w-[85%] md:max-w-[70%]">
          <div className="bg-[#20221d] text-[#fffdf4] rounded-[1.25rem] rounded-tr-sm px-4 py-3.5 shadow-[4px_4px_0_rgba(32,34,29,0.12)]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  const isLowLatency = message.modelUsed?.includes('flash-lite');
  const isHighThinking = message.modelUsed?.includes('pro-preview') || message.mode === 'thinking';

  return (
    <div className="flex justify-start my-4 group">
      <div className="flex items-start gap-3 max-w-[95%] md:max-w-[85%]">
        {/* Agent Avatar */}
        <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>

        {/* Message Card */}
        <div className="flex-1 bg-[#fffdf4]/95 border border-black/10 rounded-[1.25rem] rounded-tl-sm p-4 sm:p-5 shadow-[0_10px_30px_rgba(76,67,28,0.08)] overflow-hidden">
          {/* Header badges: Model & Latency */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-stone-800">Autonomous Agent</span>
              {message.modelUsed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono text-[11px]">
                  {message.modelUsed}
                </span>
              )}
              {isLowLatency && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
                  <Zap className="w-3 h-3 text-amber-600" />
                  Low Latency
                </span>
              )}
              {isHighThinking && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                  <Brain className="w-3 h-3 text-indigo-600" />
                  High Thinking
                </span>
              )}
              {message.mode === 'ultra' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  Unrestricted Power
                </span>
              )}
              {message.latencyMs !== undefined && (
                <span className="text-stone-400 text-[11px]">
                  {message.latencyMs}ms
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleSpeak}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isSpeaking ? 'bg-amber-100 text-amber-800' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Thinking process fold if available */}
          {message.thinkingContent && (
            <div className="mb-3 border border-indigo-100 bg-indigo-50/50 rounded-xl p-3">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center justify-between w-full text-left text-xs font-medium text-indigo-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  Reasoning Process ({showThinking ? 'Expanded' : 'Collapsed'})
                </span>
                {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showThinking && (
                <div className="mt-2 text-xs text-indigo-950/80 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pt-2 border-t border-indigo-100/60">
                  {message.thinkingContent}
                </div>
              )}
            </div>
          )}

          {/* Rendered Markdown Body */}
          <div className="markdown-body prose prose-stone max-w-none text-sm leading-relaxed text-stone-800">
            <Markdown>{message.content}</Markdown>
          </div>

          {/* Interactive Code Sandbox if code blocks exist */}
          {jsCodeBlocks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <Terminal className="w-3.5 h-3.5 text-stone-600" />
                  <span>Code Sandbox ({jsCodeBlocks.length} block{jsCodeBlocks.length > 1 ? 's' : ''})</span>
                </div>
                <button
                  onClick={() => handleRunCode(jsCodeBlocks[0])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Execute first code block safely in browser sandbox"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute Sandbox</span>
                </button>
              </div>

              {showCodeRunner && executionOutput && (
                <div className="mt-2 p-3 rounded-xl bg-stone-950 text-stone-100 font-mono text-xs border border-stone-800">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      Sandbox Runtime Output
                    </span>
                    <button
                      onClick={() => setShowCodeRunner(false)}
                      className="text-stone-400 hover:text-white cursor-pointer text-xs"
                    >
                      Hide
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap overflow-x-auto max-h-48 text-[11px] leading-relaxed text-emerald-400">
                    {executionOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Grounding Web Sources if available */}
          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between gap-1.5 text-xs font-medium text-stone-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Web Sources ({message.groundingSources.length}):</span>
                </div>
                {onOpenSourcesGrid && (
                  <button
                    onClick={onOpenSourcesGrid}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Sources Grid</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.groundingSources.slice(0, 5).map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs transition-colors group/link max-w-[240px] truncate"
                    title={source.title || source.url}
                  >
                    <span className="truncate">{source.title || 'Source Link'}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-stone-400 group-hover/link:text-stone-700 shrink-0" />
                  </a>
                ))}
                {message.groundingSources.length > 5 && onOpenSourcesGrid && (
                  <button
                    onClick={onOpenSourcesGrid}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    +{message.groundingSources.length - 5} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
