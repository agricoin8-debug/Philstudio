import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Radio, 
  Copy, 
  Check, 
  Terminal, 
  ArrowDownLeft, 
  ArrowUpRight,
  Bot,
  Hash,
  Sparkles
} from 'lucide-react';
import { GatewayChannel, GatewayEvent, GatewayPlatform } from '../types';

interface ChannelGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: GatewayChannel[];
  onToggleChannel: (id: string) => void;
  onUpdateChannel: (id: string, updates: Partial<GatewayChannel>) => void;
  events: GatewayEvent[];
  onSimulateInbound: (platform: GatewayPlatform, sender: string, message: string) => Promise<string | void>;
  onClearEvents: () => void;
}

export const ChannelGatewayModal: React.FC<ChannelGatewayModalProps> = ({
  isOpen,
  onClose,
  channels,
  onToggleChannel,
  onUpdateChannel,
  events,
  onSimulateInbound,
  onClearEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'simulator' | 'logs' | 'endpoints'>('channels');
  const [selectedPlatform, setSelectedPlatform] = useState<GatewayPlatform>('discord');
  const [simSender, setSimSender] = useState('developer#1337');
  const [simMessage, setSimMessage] = useState('Can you review our latest authentication service PR and check for token expiration race conditions?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ outbound: string; platform: GatewayPlatform } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const connectedCount = channels.filter((c) => c.status === 'connected' && c.enabled).length;

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimResult(null);

    try {
      const responseText = await onSimulateInbound(selectedPlatform, simSender, simMessage);
      if (responseText) {
        setSimResult({ outbound: responseText, platform: selectedPlatform });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const getPlatformIcon = (platform: GatewayPlatform) => {
    switch (platform) {
      case 'discord':
        return <span className="font-bold text-indigo-600">#D</span>;
      case 'slack':
        return <span className="font-bold text-amber-600">#S</span>;
      case 'telegram':
        return <span className="font-bold text-sky-500">TG</span>;
      case 'whatsapp':
        return <span className="font-bold text-emerald-600">WA</span>;
      default:
        return <Radio className="w-4 h-4 text-purple-600" />;
    }
  };

  const copyWebhookUrl = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/api/agent/channel/webhook`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">OpenClaw Multi-Channel Gateway</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {connectedCount} Connected Platforms
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Bidirectional gateway routing user interactions across Discord, Slack, Telegram, WhatsApp & Webhooks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 border-b border-stone-200/80 bg-stone-50/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Channels ({channels.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Live Inbound Simulator
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Activity Logs ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'endpoints'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Webhook API
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: Channels Overview */}
          {activeTab === 'channels' && (
            <div className="space-y-3">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className={`border rounded-xl p-4 transition-all ${
                    ch.enabled ? 'border-stone-200 bg-white shadow-2xs' : 'border-stone-200/60 bg-stone-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-mono text-sm">
                        {getPlatformIcon(ch.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-stone-900">{ch.name}</h3>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {ch.platform}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            ch.status === 'connected'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ch.status === 'connected' ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                            {ch.status === 'connected' ? 'Ready / Active' : 'Idle'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Bot Handle: <span className="font-mono text-stone-700">{ch.botUsername || '@OpenClawBot'}</span> • Dispatched: {ch.messagesCount} events
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleChannel(ch.id)}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                          ch.enabled ? 'bg-blue-600' : 'bg-stone-300'
                        }`}
                        title={ch.enabled ? 'Disable channel' : 'Enable channel'}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            ch.enabled ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Live Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold block mb-0.5">⚡ OpenClaw Gateway Inbound Simulator</span>
                Simulate an incoming message from any external chat platform. The autonomous agent will format its response according to the platform's dialect (e.g. Discord Markdown, Slack mrkdwn, or Telegram formatting).
              </div>

              <form onSubmit={handleRunSimulation} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Source Platform</label>
                    <select
                      value={selectedPlatform}
                      onChange={(e: any) => setSelectedPlatform(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="discord">Discord (#engineering)</option>
                      <option value="slack">Slack (#general-ai)</option>
                      <option value="telegram">Telegram (Direct Message)</option>
                      <option value="whatsapp">WhatsApp (Business API)</option>
                      <option value="webhook">Custom Webhook Integration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Simulated User Handle</label>
                    <input
                      type="text"
                      value={simSender}
                      onChange={(e) => setSimSender(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Inbound Message Content</label>
                  <textarea
                    rows={3}
                    required
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="Enter message as sent from Discord or Slack..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Agent Processing Across Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Simulate Inbound & Dispatch</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Simulation Result Preview */}
              {simResult && (
                <div className="mt-4 p-4 rounded-xl border border-stone-200 bg-stone-900 text-stone-100 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      Outbound Dispatched to [{simResult.platform.toUpperCase()}]
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      HTTP 200 Delivered
                    </span>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto text-stone-200">
                    {simResult.outbound}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Activity Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
                <span>Recent Gateway Activity Dispatches</span>
                {events.length > 0 && (
                  <button
                    onClick={onClearEvents}
                    className="text-stone-400 hover:text-rose-600 text-[11px] cursor-pointer"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              {events.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  No gateway events logged yet. Use the Live Inbound Simulator to test events.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          evt.direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {evt.direction === 'inbound' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 capitalize">{evt.platform}</span>
                            <span className="text-stone-400">•</span>
                            <span className="font-mono text-[11px] text-stone-600">{evt.sender}</span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-stone-700 mt-1 leading-relaxed">{evt.content}</p>
                        </div>
                      </div>

                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono shrink-0">
                        {evt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Endpoints */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-semibold text-stone-900 block">HTTP Webhook Ingest Endpoint</span>
                <p className="text-stone-600">
                  External services (Discord Webhooks, Slack Slash Commands, Telegram Bots) can post directly to this endpoint:
                </p>
                <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-lg text-stone-200 font-mono text-[11px]">
                  <span>POST /api/agent/channel/webhook</span>
                  <button
                    onClick={copyWebhookUrl}
                    className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer"
                    title="Copy full webhook URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-semibold text-stone-900 block">Example cURL Payload</span>
                <pre className="p-3 bg-stone-900 text-stone-200 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed">
{`curl -X POST "${window.location.origin}/api/agent/channel/webhook" \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "discord",
    "sender": "@alex_dev",
    "message": "Summarize today\\x27s deployment changes."
  }'`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <span>OpenClaw Omni-Channel protocol routing active.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
