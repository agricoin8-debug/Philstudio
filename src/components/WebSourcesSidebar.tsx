import React, { useState, useMemo } from 'react';
import {
  Globe,
  X,
  ExternalLink,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Share2,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AggregatedSource } from '../types';

interface WebSourcesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sources: AggregatedSource[];
  onTriggerResearchPrompt: (query: string) => void;
}

export const WebSourcesSidebar: React.FC<WebSourcesSidebarProps> = ({
  isOpen,
  onClose,
  sources,
  onTriggerResearchPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Extract unique domains with counts
  const domainsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    sources.forEach((s) => {
      if (s.domain) {
        counts[s.domain] = (counts[s.domain] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [sources]);

  // Filter sources
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.url && s.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.queryPrompt && s.queryPrompt.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDomain = selectedDomain === 'all' || s.domain === selectedDomain;

      return matchesSearch && matchesDomain;
    });
  }, [sources, searchQuery, selectedDomain]);

  if (!isOpen) return null;

  const handleCopyUrl = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyAll = () => {
    if (sources.length === 0) return;
    const formatted = sources
      .map((s, i) => `${i + 1}. [${s.title || s.domain || 'Source'}](${s.url})\n   Domain: ${s.domain}`)
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sources, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agent-web-sources-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer / Modal Container */}
      <div
        className={`relative z-10 bg-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out h-full overflow-hidden ${
          isExpandedModal
            ? 'w-full max-w-5xl my-auto mx-auto h-[90vh] rounded-2xl border border-stone-200'
            : 'w-full md:w-[580px] lg:w-[640px] border-l border-stone-200'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">Web Research Sources</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-900 text-white">
                  {sources.length}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Aggregated Google Search grounded citations & live references
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {sources.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  className="p-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer flex items-center gap-1"
                  title="Copy all sources as Markdown citations"
                >
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline text-xs">{copiedAll ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="p-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer flex items-center gap-1"
                  title="Export sources as JSON"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Export</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsExpandedModal(!isExpandedModal)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer hidden md:flex items-center"
              title={isExpandedModal ? 'Collapse to Sidebar' : 'Expand to Full Modal'}
            >
              {isExpandedModal ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="px-5 py-3 border-b border-stone-200 bg-white space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, domain, query, or URL..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 focus:bg-white text-stone-800 placeholder:text-stone-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Domain Chips */}
          {domainsWithCount.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-medium text-stone-400 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Domains:
              </span>
              <button
                onClick={() => setSelectedDomain('all')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedDomain === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({sources.length})
              </button>
              {domainsWithCount.map(([domain, count]) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain === selectedDomain ? 'all' : domain)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 truncate max-w-[150px] ${
                    selectedDomain === domain
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  title={`${domain} (${count})`}
                >
                  {domain} <span className="opacity-70 font-mono">({count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area: Grid-based View */}
        <div className="flex-1 overflow-y-auto p-5 bg-stone-50/40">
          {sources.length === 0 ? (
            /* Empty state when no sources yet */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-800 mb-1">No Web Sources Gathered Yet</h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                When the agent conducts live Google Search research or answers queries requiring factual citations, verified sources will be automatically collected here in this clean grid view.
              </p>
              <div className="w-full space-y-1.5 text-left">
                <span className="text-[11px] font-semibold text-stone-500 block">
                  Click to launch instant web research:
                </span>
                {[
                  'Current state of quantum computing algorithms in 2026',
                  'Latest breakthroughs in reusable orbital rocket systems',
                  'Global trends in renewable energy adoption and grid storage',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onClose();
                      onTriggerResearchPrompt(prompt);
                    }}
                    className="w-full text-left text-xs text-stone-700 hover:text-stone-900 hover:bg-white p-2.5 rounded-xl border border-stone-200 bg-stone-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 opacity-70 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          ) : filteredSources.length === 0 ? (
            /* No search results */
            <div className="py-12 text-center text-stone-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-stone-400" />
              <p className="text-xs">No sources match your current filter query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('all');
                }}
                className="mt-2 text-xs text-stone-800 font-medium underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            /* Grid View of Sources */
            <div
              className={`grid gap-3.5 ${
                isExpandedModal
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {filteredSources.map((source, idx) => {
                const isCopied = copiedUrl === source.url;
                return (
                  <div
                    key={`${source.url}-${idx}`}
                    className="group flex flex-col justify-between bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all duration-150"
                  >
                    <div>
                      {/* Domain Header & Favicon */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                              source.domain || 'google.com'
                            )}&sz=32`}
                            alt=""
                            className="w-4 h-4 rounded-xs shrink-0 bg-stone-100"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="text-[11px] font-semibold text-stone-600 truncate uppercase tracking-wider">
                            {source.domain || 'External Link'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Source Title */}
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {source.title || source.url}
                      </h4>

                      {/* Snippet or query context */}
                      {source.snippet ? (
                        <p className="mt-1.5 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {source.snippet}
                        </p>
                      ) : source.queryPrompt ? (
                        <p className="mt-1.5 text-[11px] text-stone-400 italic line-clamp-1">
                          Query: "{source.queryPrompt}"
                        </p>
                      ) : null}
                    </div>

                    {/* Bottom Actions & URL Preview */}
                    <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-stone-400 truncate font-mono max-w-[170px]" title={source.url}>
                        {source.url ? new URL(source.url).pathname : ''}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyUrl(source.url)}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                          title={isCopied ? 'URL Copied!' : 'Copy URL'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 text-stone-700 hover:text-white text-[11px] font-medium transition-all duration-150 cursor-pointer"
                          title="Open external source in new tab"
                        >
                          <span>Visit</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        {sources.length > 0 && (
          <div className="px-5 py-2.5 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              Showing {filteredSources.length} of {sources.length} grounded sources
            </span>
            <span className="text-stone-400">Google Search Grounding Engine</span>
          </div>
        )}
      </div>
    </div>
  );
};
