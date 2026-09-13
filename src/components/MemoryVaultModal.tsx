import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  Sparkles, 
  Download, 
  Upload, 
  FileText, 
  AlertCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { MemoryEntry } from '../types';

interface MemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryEntry[];
  onAddMemory: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
  onUpdateMemory: (id: string, updates: Partial<MemoryEntry>) => void;
  onDeleteMemory: (id: string) => void;
  onToggleMemory: (id: string) => void;
  onClearMemories: () => void;
  onLoadPresets: () => void;
}

export const MemoryVaultModal: React.FC<MemoryVaultModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onToggleMemory,
  onClearMemories,
  onLoadPresets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Memory Form State
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryEntry['category']>('preference');
  const [newImportance, setNewImportance] = useState<MemoryEntry['importance']>('high');

  // Edit State
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Knowledge' },
    { id: 'preference', label: 'Preferences' },
    { id: 'project', label: 'Projects' },
    { id: 'technical', label: 'Technical Stack' },
    { id: 'identity', label: 'Identity & Context' },
    { id: 'general', label: 'General Facts' },
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || m.key.toLowerCase().includes(query) || m.value.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const activeCount = memories.filter((m) => m.enabled).length;

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    onAddMemory({
      key: newKey.trim(),
      value: newValue.trim(),
      category: newCategory,
      importance: newImportance,
      enabled: true,
    });

    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const handleStartEdit = (entry: MemoryEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.value);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    onUpdateMemory(id, { value: editValue.trim() });
    setEditingId(null);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-memory-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getImportanceBadge = (imp: MemoryEntry['importance']) => {
    switch (imp) {
      case 'high':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">High Priority</span>;
      case 'medium':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">Medium</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">Standard</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">Long-Term Memory Vault</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-100 text-violet-800 border border-violet-200">
                  {activeCount} / {memories.length} Active
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Persistent semantic memory bank injected into every autonomous agent reasoning cycle.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              title="Export memory vault to JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-stone-200/80 bg-stone-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search facts, preferences, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onLoadPresets}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200/70 rounded-lg transition-colors cursor-pointer border border-stone-200"
              title="Add common developer presets"
            >
              Load Presets
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-5 py-2 border-b border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-violet-100 text-violet-800 font-semibold'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Add New Memory Form */}
          {isAdding && (
            <form onSubmit={handleCreateMemory} className="p-4 rounded-xl border border-violet-200 bg-violet-50/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  Store New Persistent Fact or Preference
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Concept / Key</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Coding Style"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="preference">Preference</option>
                    <option value="project">Project</option>
                    <option value="technical">Technical Stack</option>
                    <option value="identity">Identity</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Importance</label>
                  <select
                    value={newImportance}
                    onChange={(e: any) => setNewImportance(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Fact / Directive Content</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Always use TypeScript with strict interfaces. Do not use any types."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          )}

          {/* Memory Entries List */}
          <div className="space-y-2.5">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No memories found. Click "Add Memory" or "Load Presets" to seed the memory vault.
              </div>
            ) : (
              filteredMemories.map((entry) => {
                const isEditing = editingId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`border rounded-xl p-3.5 transition-all ${
                      entry.enabled
                        ? 'border-stone-200 bg-white shadow-2xs'
                        : 'border-stone-200/60 bg-stone-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-xs text-stone-900">{entry.key}</span>
                          <span className="text-[10px] capitalize bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                            {entry.category}
                          </span>
                          {getImportanceBadge(entry.importance)}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              rows={2}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-violet-300 bg-violet-50/20 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(entry.id)}
                                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-medium rounded cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 text-[11px] rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-700 leading-relaxed break-words">{entry.value}</p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Edit fact"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onToggleMemory(entry.id)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            entry.enabled ? 'bg-violet-600' : 'bg-stone-300'
                          }`}
                          title={entry.enabled ? 'Deactivate memory' : 'Activate memory'}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              entry.enabled ? 'left-4.5' : 'left-0.5'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => onDeleteMemory(entry.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Active memories are automatically injected into the agent prompt.</span>
          </div>
          <div className="flex items-center gap-2">
            {memories.length > 0 && (
              <button
                onClick={onClearMemories}
                className="text-stone-400 hover:text-rose-600 text-xs px-2 py-1 rounded cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
