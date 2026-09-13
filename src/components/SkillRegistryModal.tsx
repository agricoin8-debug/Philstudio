import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Code2, 
  Terminal, 
  Globe, 
  ShieldCheck, 
  MessageSquare, 
  Layers,
  Play,
  FileCode,
  Info
} from 'lucide-react';
import { AgentSkill } from '../types';

interface SkillRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: AgentSkill[];
  onToggleSkill: (id: string) => void;
  onAddCustomSkill: (skill: Omit<AgentSkill, 'id' | 'isBuiltIn'>) => void;
  onDeleteSkill: (id: string) => void;
  onResetSkills: () => void;
  onTestSkillInChat: (skill: AgentSkill) => void;
}

export const SkillRegistryModal: React.FC<SkillRegistryModalProps> = ({
  isOpen,
  onClose,
  skills,
  onToggleSkill,
  onAddCustomSkill,
  onDeleteSkill,
  onResetSkills,
  onTestSkillInChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  // Form state for custom skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'developer' | 'system' | 'research' | 'communication' | 'custom'>('custom');
  const [newSkillDirective, setNewSkillDirective] = useState('');
  const [newSkillSchema, setNewSkillSchema] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Skills' },
    { id: 'developer', label: 'Developer & Code' },
    { id: 'system', label: 'System & Shell' },
    { id: 'research', label: 'Research & Web' },
    { id: 'communication', label: 'Communication' },
    { id: 'custom', label: 'Custom' },
  ];

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const activeCount = skills.filter((s) => s.enabled).length;

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !newSkillDirective.trim()) return;

    onAddCustomSkill({
      name: newSkillName.trim(),
      description: newSkillDesc.trim() || 'Custom user-defined autonomous skill',
      category: newSkillCategory,
      enabled: true,
      version: '1.0.0',
      systemDirective: newSkillDirective.trim(),
      parametersSchema: newSkillSchema.trim() || undefined,
    });

    setNewSkillName('');
    setNewSkillDesc('');
    setNewSkillDirective('');
    setNewSkillSchema('');
    setIsAddingNew(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'developer':
        return <Code2 className="w-4 h-4 text-indigo-600" />;
      case 'system':
        return <Terminal className="w-4 h-4 text-emerald-600" />;
      case 'research':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'communication':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      default:
        return <Cpu className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">OpenClaw Skill Registry</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {activeCount} / {skills.length} Active
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Autonomous modular tools and execution capabilities dynamically injected into the agent runtime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetSkills}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              title="Reset to default OpenClaw skills"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs & Add Button */}
        <div className="px-5 py-3 border-b border-stone-200/80 bg-stone-50/30 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Skill</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add Custom Skill Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateSkill} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Define New OpenClaw Autonomous Skill
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Skill Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PostgreSQL Query Explainer"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e: any) => setNewSkillCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="developer">Developer</option>
                    <option value="system">System</option>
                    <option value="research">Research</option>
                    <option value="communication">Communication</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Brief Description</label>
                <input
                  type="text"
                  placeholder="e.g., Analyzes SQL query execution plans and recommends index optimizations"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  System Directive / Execution Protocol
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Define instructions for the agent when this skill is invoked..."
                  value={newSkillDirective}
                  onChange={(e) => setNewSkillDirective(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Parameters Schema (Optional JSON)
                </label>
                <input
                  type="text"
                  placeholder='{"query": "string", "databaseVersion": "string"}'
                  value={newSkillSchema}
                  onChange={(e) => setNewSkillSchema(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Register Skill
                </button>
              </div>
            </form>
          )}

          {/* Skills List */}
          <div className="space-y-3">
            {filteredSkills.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                No skills found in this category.
              </div>
            ) : (
              filteredSkills.map((skill) => {
                const isExpanded = expandedSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className={`border rounded-xl p-4 transition-all ${
                      skill.enabled
                        ? 'border-stone-200 bg-white shadow-2xs'
                        : 'border-stone-200/60 bg-stone-50/50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 shrink-0 mt-0.5">
                          {getCategoryIcon(skill.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-stone-900">{skill.name}</h3>
                            <span className="text-[10px] text-stone-400 font-mono">v{skill.version}</span>
                            {skill.isBuiltIn && (
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                                Built-In
                              </span>
                            )}
                            <span className="text-[10px] capitalize bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium border border-indigo-100">
                              {skill.category}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{skill.description}</p>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onTestSkillInChat(skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                          title="Invoke and test skill in chat"
                        >
                          <Play className="w-3 h-3 fill-indigo-600" />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => onToggleSkill(skill.id)}
                          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                            skill.enabled ? 'bg-indigo-600' : 'bg-stone-300'
                          }`}
                          title={skill.enabled ? 'Disable skill' : 'Enable skill'}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              skill.enabled ? 'left-5' : 'left-1'
                            }`}
                          />
                        </button>

                        {!skill.isBuiltIn && (
                          <button
                            onClick={() => onDeleteSkill(skill.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                            title="Delete custom skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expand details button */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                        className="text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
                      >
                        {isExpanded ? 'Hide directives & schema ▲' : 'View directives & schema ▼'}
                      </button>
                      <span className="text-stone-400 text-[10px]">
                        Status: {skill.enabled ? 'Active in agent prompt' : 'Disabled'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-2 animate-in fade-in">
                        <div>
                          <span className="font-semibold text-stone-800 block text-[11px] mb-0.5">
                            System Directive:
                          </span>
                          <p className="text-stone-600 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                            {skill.systemDirective}
                          </p>
                        </div>
                        {skill.parametersSchema && (
                          <div>
                            <span className="font-semibold text-stone-800 block text-[11px] mb-0.5">
                              Parameters Schema:
                            </span>
                            <pre className="text-[10px] bg-white p-2 rounded border border-stone-200 text-stone-700 overflow-x-auto font-mono">
                              {skill.parametersSchema}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Active skills are automatically synthesized into the autonomous agent's reasoning matrix.</span>
          </div>
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
