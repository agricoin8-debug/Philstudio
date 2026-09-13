import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Download,
  Check,
  Star,
  ShieldCheck,
  Package,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  FileText,
  AlertCircle,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { ClawHubSkill, ClawHubCategory, AgentSkill } from '../types';
import { CLAWHUB_SKILLS_CATALOG } from '../data/clawhubCatalog';

interface ClawHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedSkills: AgentSkill[];
  onInstallSkill: (skill: ClawHubSkill) => void;
  onUninstallSkill: (skillId: string) => void;
}

export const ClawHubModal: React.FC<ClawHubModalProps> = ({
  isOpen,
  onClose,
  installedSkills,
  onInstallSkill,
  onUninstallSkill,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'publish'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<ClawHubCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewSkill, setPreviewSkill] = useState<ClawHubSkill | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Publish Form State
  const [publishName, setPublishName] = useState('');
  const [publishSlug, setPublishSlug] = useState('');
  const [publishCategory, setPublishCategory] = useState<ClawHubCategory>('developer');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishDirective, setPublishDirective] = useState('');
  const [publishSchema, setPublishSchema] = useState('{"param1": "string"}');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Check if a ClawHub skill is installed in active agent skills
  const isSkillInstalled = (slug: string, id: string): boolean => {
    return installedSkills.some(
      (s) => s.id === id || s.id === slug || s.name.toLowerCase().includes(slug.split('/')[1]?.toLowerCase() || '')
    );
  };

  const filteredSkills = useMemo(() => {
    return CLAWHUB_SKILLS_CATALOG.filter((skill) => {
      const matchesCat = selectedCategory === 'all' || skill.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.slug.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyInstallCmd = (slug: string) => {
    navigator.clipboard.writeText(`openclaw install ${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishName || !publishSlug || !publishDirective) return;

    const newSkill: ClawHubSkill = {
      id: `clawhub-${Date.now()}`,
      slug: publishSlug.startsWith('custom/') ? publishSlug : `custom/${publishSlug}`,
      name: publishName,
      author: 'local-operator',
      category: publishCategory,
      version: '1.0.0',
      description: publishDescription || 'Custom user-contributed OpenClaw skill.',
      stars: 1,
      downloads: 1,
      verified: true,
      securityAudit: 'community',
      tags: ['custom', publishCategory],
      parametersSchema: publishSchema,
      systemDirective: publishDirective,
      skillMd: `# ${publishName}\n\n${publishDescription}\n\n## Directive\n${publishDirective}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    CLAWHUB_SKILLS_CATALOG.unshift(newSkill);
    onInstallSkill(newSkill);
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setActiveTab('browse');
      setSearchQuery(publishName);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-1.5">
                  ClawHub Skill Registry
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                    openclaw/clawhub
                  </span>
                </h2>
                <a
                  href="https://github.com/openclaw/clawhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-stone-700 transition-colors"
                  title="View GitHub Repository"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-stone-600">
                The public package manager and marketplace for autonomous OpenClaw agent skills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'browse'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Browse Registry
              </button>
              <button
                onClick={() => setActiveTab('publish')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'publish'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Publish Skill
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'browse' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Controls Bar */}
            <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search skills, packages, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'crypto', label: 'Solana & Web3' },
                    { id: 'developer', label: 'DevOps & Code' },
                    { id: 'system', label: 'System' },
                    { id: 'security', label: 'Security' },
                    { id: 'research', label: 'Research' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid & Preview Layout */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSkills.map((skill) => {
                  const installed = isSkillInstalled(skill.slug, skill.id);
                  return (
                    <div
                      key={skill.id}
                      className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-xs">
                              {skill.slug.includes('solana') ? 'SOL' : skill.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                                {skill.name}
                                {skill.verified && (
                                  <span title="ClawHub Verified" className="inline-flex items-center">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  </span>
                                )}
                              </h3>
                              <p className="text-[11px] text-stone-600 font-mono flex items-center gap-1">
                                <span>{skill.slug}</span>
                                <span>•</span>
                                <span>v{skill.version}</span>
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                            {skill.category}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                          {skill.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {skill.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-600 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-3 text-xs text-stone-600">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            {skill.stars.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5 text-stone-600" />
                            {skill.downloads.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewSkill(skill)}
                            className="px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                            title="Inspect SKILL.md specification"
                          >
                            View SKILL.md
                          </button>

                          <button
                            onClick={() => handleCopyInstallCmd(skill.slug)}
                            className="p-1 text-stone-600 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                            title="Copy openclaw install CLI command"
                          >
                            {copiedSlug === skill.slug ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {installed ? (
                            <button
                              onClick={() => onUninstallSkill(skill.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all cursor-pointer group"
                            >
                              <Check className="w-3 h-3 group-hover:hidden" />
                              <span className="group-hover:hidden">Installed</span>
                              <span className="hidden group-hover:inline">Uninstall</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onInstallSkill(skill)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-2xs transition-all cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Install
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Publish Tab */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/50">
            <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Publish Skill to ClawHub Registry
                </h3>
                <p className="text-xs text-stone-600">
                  Share custom autonomous tools with the OpenClaw community or bundle your private workflows.
                </p>
              </div>

              {publishSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Skill successfully packaged and registered into your local OpenClaw runtime!
                </div>
              )}

              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solana Liquidity Sniper"
                      value={publishName}
                      onChange={(e) => setPublishName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Package Slug / Identifier
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sendaifun/liquidity-sniper"
                      value={publishSlug}
                      onChange={(e) => setPublishSlug(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={publishCategory}
                      onChange={(e) => setPublishCategory(e.target.value as ClawHubCategory)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white"
                    >
                      <option value="crypto">Solana & Web3</option>
                      <option value="developer">Developer & DevOps</option>
                      <option value="system">System & OS</option>
                      <option value="security">Security & Audit</option>
                      <option value="research">Academic & Research</option>
                      <option value="communication">Communication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Parameters Schema (JSON)
                    </label>
                    <input
                      type="text"
                      value={publishSchema}
                      onChange={(e) => setPublishSchema(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Summary Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Short description of what the skill empowers the agent to execute..."
                    value={publishDescription}
                    onChange={(e) => setPublishDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    System Directive / Protocol Prompt
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide explicit instructions on when and how the autonomous agent must apply this skill..."
                    value={publishDirective}
                    onChange={(e) => setPublishDirective(e.target.value)}
                    className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 focus:bg-white font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Package & Register Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SKILL.md Inspector Drawer */}
        {previewSkill && (
          <div className="absolute inset-0 z-20 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-100">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-600" />
                    {previewSkill.name} - SKILL.md
                  </h3>
                  <p className="text-xs text-stone-600 font-mono">{previewSkill.slug}</p>
                </div>
                <button
                  onClick={() => setPreviewSkill(null)}
                  className="p-1 text-stone-600 hover:text-stone-900 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Author:</span>
                    <span className="font-semibold text-stone-900">@{previewSkill.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Security Audit:</span>
                    <span className="text-emerald-700 font-medium capitalize">
                      {previewSkill.securityAudit} Passed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Parameters Schema:</span>
                    <span className="font-mono text-stone-700 truncate max-w-[250px]">
                      {previewSkill.parametersSchema}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    System Directive
                  </h4>
                  <div className="bg-stone-900 text-amber-300 p-3 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {previewSkill.systemDirective}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    SKILL.md Source
                  </h4>
                  <pre className="bg-stone-100 p-3 rounded-lg font-mono text-xs text-stone-800 whitespace-pre-wrap overflow-x-auto border border-stone-200">
                    {previewSkill.skillMd}
                  </pre>
                </div>
              </div>

              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
                <button
                  onClick={() => handleCopyInstallCmd(previewSkill.slug)}
                  className="px-3 py-1.5 text-xs text-stone-700 font-mono bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-stone-600" />
                  openclaw install {previewSkill.slug}
                </button>

                {isSkillInstalled(previewSkill.slug, previewSkill.id) ? (
                  <button
                    onClick={() => {
                      onUninstallSkill(previewSkill.id);
                      setPreviewSkill(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Uninstall Skill
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onInstallSkill(previewSkill);
                      setPreviewSkill(null);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install into Agent
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
