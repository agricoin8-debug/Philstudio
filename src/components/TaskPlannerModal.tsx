import React, { useState } from 'react';
import { X, CheckCircle2, Circle, ArrowRight, Sparkles, Loader2, Play } from 'lucide-react';
import { TaskStep } from '../types';

interface TaskPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePlanInChat: (goal: string, steps: TaskStep[]) => void;
}

export const TaskPlannerModal: React.FC<TaskPlannerModalProps> = ({
  isOpen,
  onClose,
  onExecutePlanInChat,
}) => {
  const [goal, setGoal] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDecompose = async () => {
    if (!goal.trim()) return;
    setIsDecomposing(true);
    setError(null);

    try {
      const res = await fetch('/api/agent/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to decompose task');
      }

      const data = await res.json();
      if (Array.isArray(data.steps)) {
        setSteps(
          data.steps.map((s: any, idx: number) => ({
            id: s.id || `step-${idx + 1}`,
            title: s.title || s.description || `Step ${idx + 1}`,
            status: 'pending',
          }))
        );
      } else {
        throw new Error('Invalid step format returned');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error decomposing task');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleStartExecution = () => {
    if (steps.length === 0) return;
    onExecutePlanInChat(goal, steps);
    onClose();
  };

  const sampleGoals = [
    'Autonomous market research report on AI robotics in healthcare',
    'Design an architectural blueprint for a real-time event streaming pipeline',
    'Formulate a 4-week executive communications strategy for corporate restructuring',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">Autonomous Task Planner</h2>
            <p className="text-xs text-stone-500">Decompose complex goals into sequential autonomous sub-tasks</p>
          </div>
        </div>

        {/* Goal Input */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Specify High-Level Objective or Task:
            </label>
            <div className="flex gap-2">
              <input
                id="task-goal-input"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDecompose()}
                placeholder="e.g. Conduct in-depth research on solid-state battery tech..."
                className="flex-1 px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 focus:border-stone-800"
              />
              <button
                id="decompose-btn"
                onClick={handleDecompose}
                disabled={isDecomposing || !goal.trim()}
                className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {isDecomposing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <span>Decompose</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick presets */}
          {!steps.length && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-stone-400 font-medium">Or select a quick objective:</span>
              <div className="flex flex-col gap-1">
                {sampleGoals.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setGoal(sample)}
                    className="text-left text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 p-2 rounded-lg border border-stone-100 transition-colors cursor-pointer"
                  >
                    • {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Decomposed Steps display */}
          {steps.length > 0 && (
            <div className="mt-4 space-y-3 pt-3 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800">
                  Autonomous Execution Roadmap ({steps.length} steps):
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                  >
                    <span className="font-mono text-stone-400 font-semibold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">{step.title}</p>
                    </div>
                    <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSteps([])}
                  className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 rounded-lg cursor-pointer"
                >
                  Reset Plan
                </button>
                <button
                  id="execute-plan-btn"
                  onClick={handleStartExecution}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Plan with Agent</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
