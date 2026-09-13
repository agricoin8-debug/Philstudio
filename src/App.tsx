import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { TaskPlannerModal } from './components/TaskPlannerModal';
import { AgentStatusBanner } from './components/AgentStatusBanner';
import { WebSourcesSidebar } from './components/WebSourcesSidebar';
import { PowerSettingsModal } from './components/PowerSettingsModal';
import { SkillRegistryModal } from './components/SkillRegistryModal';
import { MemoryVaultModal } from './components/MemoryVaultModal';
import { ChannelGatewayModal } from './components/ChannelGatewayModal';
import { ClawHubModal } from './components/ClawHubModal';
import { SolanaAgentKitModal } from './components/SolanaAgentKitModal';
import { LatencyTrendChart } from './components/LatencyTrendChart';
import { SolanaPriceChart } from './components/SolanaPriceChart';
import { 
  AgentMode, 
  ChatMessage, 
  TaskStep, 
  AggregatedSource, 
  PowerSettings,
  AgentSkill,
  MemoryEntry,
  GatewayChannel,
  GatewayEvent,
  GatewayPlatform,
  ClawHubSkill
} from './types';
import {
  DEFAULT_SKILLS,
  DEFAULT_MEMORIES,
  DEFAULT_CHANNELS,
  DEFAULT_GATEWAY_EVENTS,
} from './data/openclawDefaults';
import { speakText, stopSpeaking } from './utils/speech';
import { Bot, Loader2, Sparkles, AlertCircle, Download, FileJson, FileText } from 'lucide-react';

const STORAGE_KEY = 'autonomous_agent_messages_v1';
const POWER_SETTINGS_KEY = 'autonomous_agent_power_settings_v1';
const SKILLS_STORAGE_KEY = 'openclaw_agent_skills_v1';
const MEMORY_STORAGE_KEY = 'openclaw_agent_memory_v1';
const CHANNELS_STORAGE_KEY = 'openclaw_agent_channels_v1';
const EVENTS_STORAGE_KEY = 'openclaw_agent_events_v1';

export default function App() {
  const [powerSettings, setPowerSettings] = useState<PowerSettings>(() => {
    try {
      const saved = localStorage.getItem(POWER_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load power settings:', e);
    }
    return {
      unrestrictedDepth: true,
      historyLimit: 40,
      customSystemPrompt: '',
      forceSearch: false,
      temperature: 0.7,
    };
  });

  // OpenClaw Extensible Skill Registry
  const [skills, setSkills] = useState<AgentSkill[]>(() => {
    try {
      const saved = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved skills:', e);
    }
    return DEFAULT_SKILLS;
  });

  // OpenClaw Long-Term Memory Vault
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved memories:', e);
    }
    return DEFAULT_MEMORIES;
  });

  // OpenClaw Multi-Platform Channel Gateway
  const [channels, setChannels] = useState<GatewayChannel[]>(() => {
    try {
      const saved = localStorage.getItem(CHANNELS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved channels:', e);
    }
    return DEFAULT_CHANNELS;
  });

  const [gatewayEvents, setGatewayEvents] = useState<GatewayEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved gateway events:', e);
    }
    return DEFAULT_GATEWAY_EVENTS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load saved chat history:', e);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 Hello! I am your **Autonomous AI Agent**, powered by the **OpenClaw Architecture** with native **ClawHub** & **SendAI Solana Agent Kit** integrations.

### 🌟 Active Superpower Suite:
1. 📦 **ClawHub Skill Marketplace** (\`openclaw/clawhub\`): Explore, install, and publish community and verified agent skills directly from the public registry.
2. ◎ **SendAI Solana Agent Kit** (\`sendaifun/solana-agent-kit\`): Autonomous on-chain toolkit featuring Jupiter DEX multi-hop swaps, Pyth real-time price feeds, SPL token deployment, Blinks, and RugCheck security audits.
3. 🧩 **Extensible Skill Registry**: Self-hosted modular capabilities including GitHub PR reviews, shell execution, deep web scraping, and architecture audits.
4. 🧠 **Long-Term Memory Vault**: Persistent cross-session factual memory storing project contexts, user preferences, and tech specs.
5. 🌐 **Omni-Channel Gateway**: Unified bidirectional communication across Discord, Slack, Telegram, WhatsApp, and Webhook APIs.
6. 🔥 **Max Power Mode (\`ultra\`)**: Uncapped reasoning depth and exhaustive production-grade solutions without placeholders.
7. ⚡ **Ultra-Low Latency (\`fast\`)**: Near-instant responses powered by \`gemini-3.1-flash-lite\`.
8. 🧠 **High Thinking (\`thinking\`)**: Pro Preview deep analytical reasoning with visible thought process.

How can I assist your engineering or Web3 workflow right now?`,
        timestamp: Date.now(),
        mode: 'ultra',
        modelUsed: 'gemini-3.1-pro-preview',
        latencyMs: 1420,
      },
    ];
  });

  const [currentMode, setCurrentMode] = useState<AgentMode>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isTaskPlannerOpen, setIsTaskPlannerOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isPowerSettingsOpen, setIsPowerSettingsOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isClawHubOpen, setIsClawHubOpen] = useState(false);
  const [isSolanaModalOpen, setIsSolanaModalOpen] = useState(false);
  const [showLatencyChart, setShowLatencyChart] = useState(true);
  const [showSolanaPriceChart, setShowSolanaPriceChart] = useState(true);
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync power settings to storage
  const handleSavePowerSettings = (newSettings: PowerSettings) => {
    setPowerSettings(newSettings);
    try {
      localStorage.setItem(POWER_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Could not save power settings:', e);
    }
  };

  // OpenClaw Skill Registry Handlers
  const handleToggleSkill = (id: string) => {
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleAddSkill = (newSkillData: Omit<AgentSkill, 'id'>) => {
    const newSkill: AgentSkill = {
      ...newSkillData,
      id: `skill-${Date.now()}`,
    };
    setSkills((prev) => {
      const updated = [...prev, newSkill];
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleDeleteSkill = (id: string) => {
    setSkills((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleUpdateSkill = (id: string, updates: Partial<AgentSkill>) => {
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleResetSkills = () => {
    setSkills(DEFAULT_SKILLS);
    try {
      localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(DEFAULT_SKILLS));
    } catch (e) {
      console.warn('Could not reset skills:', e);
    }
  };

  const handleInstallFromClawHub = (clawSkill: ClawHubSkill) => {
    const validCategories: AgentSkill['category'][] = ['developer', 'system', 'research', 'communication', 'crypto', 'security', 'custom'];
    const matchedCategory = validCategories.find((c) => c === clawSkill.category) || 'custom';

    const newAgentSkill: AgentSkill = {
      id: clawSkill.slug,
      name: clawSkill.name,
      category: matchedCategory,
      version: clawSkill.version,
      enabled: true,
      isBuiltIn: false,
      description: clawSkill.description,
      systemDirective: clawSkill.systemDirective,
      parametersSchema: clawSkill.parametersSchema,
    };
    setSkills((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === newAgentSkill.id || s.name === newAgentSkill.name);
      let updated: AgentSkill[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], enabled: true };
      } else {
        updated = [newAgentSkill, ...prev];
      }
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleUninstallFromClawHub = (skillId: string) => {
    setSkills((prev) => {
      const updated = prev.filter((s) => s.id !== skillId && !s.id.includes(skillId));
      try {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save skills:', e);
      }
      return updated;
    });
  };

  const handleTestSkill = (skill: AgentSkill) => {
    setIsSkillsModalOpen(false);
    handleSendMessage(
      `[OpenClaw Skill Invocation: ${skill.name}]\nDescription: ${skill.description}\nDirective Protocol: ${skill.systemDirective}\n\nPlease autonomously demonstrate this skill with a concrete, end-to-end engineering deliverable.`,
      currentMode,
      true
    );
  };

  // OpenClaw Long-Term Memory Vault Handlers
  const handleAddMemory = (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: MemoryEntry = {
      ...entry,
      id: `mem-${Date.now()}`,
      timestamp: Date.now(),
    };
    setMemories((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save memories:', e);
      }
      return updated;
    });
  };

  const handleUpdateMemory = (id: string, updates: Partial<MemoryEntry>) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save memories:', e);
      }
      return updated;
    });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save memories:', e);
      }
      return updated;
    });
  };

  const handleToggleMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save memories:', e);
      }
      return updated;
    });
  };

  const handleClearAllMemories = () => {
    setMemories([]);
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn('Could not save memories:', e);
    }
  };

  const handleLoadPresetMemories = () => {
    setMemories(DEFAULT_MEMORIES);
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(DEFAULT_MEMORIES));
    } catch (e) {
      console.warn('Could not load preset memories:', e);
    }
  };

  // OpenClaw Channel Gateway Handlers
  const handleToggleChannel = (id: string) => {
    setChannels((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
      try {
        localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save channels:', e);
      }
      return updated;
    });
  };

  const handleUpdateChannel = (id: string, updates: Partial<GatewayChannel>) => {
    setChannels((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save channels:', e);
      }
      return updated;
    });
  };

  const handleSimulateInbound = async (platform: GatewayPlatform, sender: string, message: string): Promise<string | void> => {
    const inboundId = `evt-in-${Date.now()}`;
    const inboundEvent: GatewayEvent = {
      id: inboundId,
      platform,
      direction: 'inbound',
      sender,
      content: message,
      timestamp: Date.now(),
      status: 'pending',
    };

    setGatewayEvents((prev) => {
      const updated = [inboundEvent, ...prev];
      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
      } catch (e) {
        console.warn('Could not save events:', e);
      }
      return updated;
    });

    try {
      const res = await fetch('/api/agent/channel/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          sender,
          message,
          skills: skills.filter((s) => s.enabled),
          memories: memories.filter((m) => m.enabled),
        }),
      });

      if (!res.ok) {
        throw new Error(`Channel gateway returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const outboundText = data.responseText || 'Event acknowledged by OpenClaw autonomous router.';

      const outboundId = `evt-out-${Date.now()}`;
      const outboundEvent: GatewayEvent = {
        id: outboundId,
        platform,
        direction: 'outbound',
        sender: `@OpenClaw-${platform}`,
        content: outboundText,
        timestamp: Date.now(),
        status: 'delivered',
      };

      setGatewayEvents((prev) => {
        const updated = [outboundEvent, ...prev.map((e) => (e.id === inboundId ? { ...e, status: 'processed' as const } : e))];
        try {
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
        } catch (e) {
          console.warn('Could not save events:', e);
        }
        return updated;
      });

      // Update channel activity count
      setChannels((prev) =>
        prev.map((c) =>
          c.platform === platform ? { ...c, messagesCount: c.messagesCount + 2 } : c
        )
      );

      return outboundText;
    } catch (err: any) {
      console.error('Inbound simulation failure:', err);
      return `[Channel Inbound Error]: ${err.message || 'Webhook transport failure'}`;
    }
  };

  const handleClearGatewayEvents = () => {
    setGatewayEvents([]);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn('Could not clear gateway events:', e);
    }
  };

  // Compute aggregated unique web research sources across the conversation
  const aggregatedSources: AggregatedSource[] = useMemo(() => {
    const list: AggregatedSource[] = [];
    const seenUrls = new Set<string>();

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.groundingSources && msg.groundingSources.length > 0) {
        let queryPrompt: string | undefined;
        for (let j = i - 1; j >= 0; j--) {
          if (messages[j].role === 'user') {
            queryPrompt = messages[j].content;
            break;
          }
        }

        for (const s of msg.groundingSources) {
          if (!s.url) continue;
          const normalized = s.url.trim().toLowerCase();
          if (seenUrls.has(normalized)) continue;
          seenUrls.add(normalized);

          let domain = '';
          try {
            domain = new URL(s.url).hostname.replace(/^www\./, '');
          } catch {
            domain = 'web';
          }

          list.push({
            url: s.url,
            title: s.title || domain,
            snippet: s.snippet,
            domain,
            sourceMessageId: msg.id,
            queryPrompt,
            timestamp: msg.timestamp,
          });
        }
      }
    }
    return list;
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }, [messages]);

  // Scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessageId]);

  const handleClearChat = () => {
    stopSpeaking();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setCurrentStreamingMessageId(null);
  };

  const handleSendMessage = async (text: string, mode: AgentMode, enableWebSearch: boolean) => {
    setErrorMessage(null);
    stopSpeaking();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mode,
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode,
      modelUsed: mode === 'fast' ? 'gemini-3.1-flash-lite' : mode === 'thinking' ? 'gemini-3.1-pro-preview' : 'Auto Routing...',
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);
    setCurrentStreamingMessageId(assistantPlaceholderId);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const historyLimit = powerSettings.historyLimit || 40;
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-historyLimit).map((m) => ({ role: m.role, content: m.content })),
          mode,
          enableWebSearch: enableWebSearch || powerSettings.forceSearch,
          powerSettings,
          skills: skills.filter((s) => s.enabled),
          memories: memories.filter((m) => m.enabled),
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let accumulatedThinking = '';
      let modelUsed = '';
      let latency: number | undefined = undefined;
      let groundingSources: any[] = [];

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.replace(/^data: /, '').trim();
          if (dataStr === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'meta') {
              modelUsed = data.modelUsed;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, modelUsed: data.modelUsed }
                    : msg
                )
              );
            } else if (data.type === 'chunk') {
              accumulatedContent += data.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            } else if (data.type === 'thought') {
              accumulatedThinking += data.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, thinkingContent: accumulatedThinking }
                    : msg
                )
              );
            } else if (data.type === 'grounding') {
              groundingSources = data.sources;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, groundingSources: data.sources }
                    : msg
                )
              );
            } else if (data.type === 'done') {
              latency = data.latencyMs;
              if (data.groundingSources?.length) {
                groundingSources = data.groundingSources;
              }
            } else if (data.type === 'error') {
              setErrorMessage(data.error);
            }
          } catch (err) {
            console.warn('Error parsing SSE event:', err);
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content: accumulatedContent || 'No response generated.',
                modelUsed: modelUsed || msg.modelUsed,
                latencyMs: latency,
                groundingSources: groundingSources.length ? groundingSources : msg.groundingSources,
                thinkingContent: accumulatedThinking || undefined,
              }
            : msg
        )
      );

      if (autoSpeak && accumulatedContent) {
        speakText(accumulatedContent);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Streaming request error:', err);
        setErrorMessage(err.message || 'Error occurred while contacting the agent.');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  content: `⚠️ **Error communicating with Autonomous Agent**: ${err.message || 'Unknown network error'}. Please verify your API key in Settings > Secrets.`,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleExportMarkdown = () => {
    const md = messages
      .map((m) => {
        const header = m.role === 'user' ? '### 👤 User' : `### 🤖 Assistant (${m.modelUsed || 'AI'}${m.mode ? ` • ${m.mode}` : ''})`;
        const time = new Date(m.timestamp).toLocaleTimeString();
        return `${header} _[${time}]_\n\n${m.content}\n\n---`;
      })
      .join('\n\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonomous-agent-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonomous-agent-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecutePlanInChat = (goal: string, steps: TaskStep[]) => {
    const formattedPrompt = `Please autonomously execute this multi-step task plan:
**Goal:** ${goal}

**Structured Steps:**
${steps.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

For each step, conduct necessary reasoning, synthesize factual research, and provide complete, high-quality deliverables.`;

    handleSendMessage(formattedPrompt, 'task', true);
  };

  return (
    <div className="app-shell flex flex-col min-h-screen text-stone-900 font-sans">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onClearChat={handleClearChat}
        onOpenTaskPlanner={() => setIsTaskPlannerOpen(true)}
        sourcesCount={aggregatedSources.length}
        onOpenSources={() => setIsSourcesOpen(true)}
        onOpenPowerSettings={() => setIsPowerSettingsOpen(true)}
        isUnrestrictedActive={currentMode === 'ultra' || powerSettings.unrestrictedDepth}
        skillsCount={skills.filter((s) => s.enabled).length}
        onOpenSkills={() => setIsSkillsModalOpen(true)}
        memoriesCount={memories.filter((m) => m.enabled).length}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        channelsCount={channels.filter((c) => c.status === 'connected' && c.enabled).length}
        onOpenGateway={() => setIsGatewayModalOpen(true)}
        onOpenClawHub={() => setIsClawHubOpen(true)}
        onOpenSolana={() => setIsSolanaModalOpen(true)}
        showLatencyChart={showLatencyChart}
        onToggleLatencyChart={() => setShowLatencyChart(!showLatencyChart)}
        showSolanaPriceChart={showSolanaPriceChart}
        onToggleSolanaPriceChart={() => setShowSolanaPriceChart(!showSolanaPriceChart)}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
      />

      {/* Capabilities and Intelligence Stack Banner */}
      <AgentStatusBanner currentMode={currentMode} />

      {/* Model Latency Metrics & Performance Evolution Trend Line (Recharts) */}
      {showLatencyChart && (
        <LatencyTrendChart
          messages={messages}
          currentMode={currentMode}
          onSendTestPrompt={(prompt, mode) => handleSendMessage(prompt, mode, false)}
        />
      )}

      {/* Solana Live Price & Oracle Trend Chart (Recharts) */}
      {showSolanaPriceChart && (
        <SolanaPriceChart
          onSendToChat={(prompt, mode) => handleSendMessage(prompt, mode || 'research', true)}
          onOpenSolanaKit={() => setIsSolanaModalOpen(true)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-5 overflow-y-auto">
        {/* Chat Actions & Quick Export Toolbar */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between py-1 mb-2 px-1 text-xs text-stone-500 border-b border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-400">
              {messages.length} messages in conversation
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer text-[11px]"
                title="Export chat as Markdown document"
              >
                <FileText className="w-3 h-3 text-stone-500" />
                <span>Export MD</span>
              </button>
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer text-[11px]"
                title="Export chat as JSON data"
              >
                <FileJson className="w-3 h-3 text-stone-500" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-[46vh] flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(28,25,23,0.12)] border border-stone-800">
              <Bot className="w-7 h-7 text-stone-200" />
            </div>
            <h2
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
              className="text-base sm:text-lg font-bold text-stone-900 tracking-[0.16em] uppercase mb-1.5"
            >
              Autonomous Directive Console
            </h2>
            <p
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              className="text-sm italic max-w-md text-stone-600 leading-relaxed"
            >
              Standing ready for deep mathematical reasoning, live web oracle synthesis, Solana on-chain execution, and autonomous multi-step operations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                onOpenSourcesGrid={() => setIsSourcesOpen(true)}
              />
            ))}
            {isLoading && currentStreamingMessageId && (
              <div className="flex items-center gap-2 text-xs text-stone-500 py-2 px-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-700" />
                <span>Autonomous Agent processing with unrestricted high-intelligence layer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Sticky Chatbox Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStop={handleStop}
        isLoading={isLoading}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* Autonomous Task Planner Modal */}
      <TaskPlannerModal
        isOpen={isTaskPlannerOpen}
        onClose={() => setIsTaskPlannerOpen(false)}
        onExecutePlanInChat={handleExecutePlanInChat}
      />

      {/* Dedicated Web Research Sources Grid (Sidebar / Modal) */}
      <WebSourcesSidebar
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        sources={aggregatedSources}
        onTriggerResearchPrompt={(prompt) => {
          handleSendMessage(prompt, 'research', true);
        }}
      />

      {/* Unrestricted Power Matrix & Directives Modal */}
      <PowerSettingsModal
        isOpen={isPowerSettingsOpen}
        onClose={() => setIsPowerSettingsOpen(false)}
        settings={powerSettings}
        onSaveSettings={handleSavePowerSettings}
      />

      {/* OpenClaw Extensible Skill Registry Modal */}
      <SkillRegistryModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
        onToggleSkill={handleToggleSkill}
        onAddCustomSkill={handleAddSkill}
        onDeleteSkill={handleDeleteSkill}
        onResetSkills={handleResetSkills}
        onTestSkillInChat={handleTestSkill}
      />

      {/* OpenClaw Long-Term Memory Vault Modal */}
      <MemoryVaultModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
        onToggleMemory={handleToggleMemory}
        onClearMemories={handleClearAllMemories}
        onLoadPresets={handleLoadPresetMemories}
      />

      {/* OpenClaw Multi-Platform Channel Gateway Modal */}
      <ChannelGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        channels={channels}
        onToggleChannel={handleToggleChannel}
        onUpdateChannel={handleUpdateChannel}
        events={gatewayEvents}
        onSimulateInbound={handleSimulateInbound}
        onClearEvents={handleClearGatewayEvents}
      />

      {/* ClawHub Public Skill Marketplace Modal (openclaw/clawhub) */}
      <ClawHubModal
        isOpen={isClawHubOpen}
        onClose={() => setIsClawHubOpen(false)}
        installedSkills={skills}
        onInstallSkill={handleInstallFromClawHub}
        onUninstallSkill={handleUninstallFromClawHub}
      />

      {/* Solana Agent Kit Console Modal (sendaifun/solana-agent-kit) */}
      <SolanaAgentKitModal
        isOpen={isSolanaModalOpen}
        onClose={() => setIsSolanaModalOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt, 'ultra', true)}
      />
    </div>
  );
}
