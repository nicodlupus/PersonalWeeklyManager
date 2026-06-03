import React, { useState, useEffect } from 'react';
import GoalCard, { GoalData } from './GoalCard';
import { api } from '../api/client';

function GoalFormModal({ goal, onSave, onDelete, onClose }: {
  goal?: GoalData;
  onSave: (data: GoalData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<GoalData>({
    title: '',
    category: '',
    target_value: undefined,
    current_value: 0,
    unit: '',
    year: new Date().getFullYear(),
    deadline: '',
    ...goal,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('Delete goal?')) return;
    setLoading(true);
    try { await onDelete(); onClose(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">{goal?.id ? 'Edit Goal' : 'New Goal'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Health" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" value={form.year || new Date().getFullYear()} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input type="number" value={form.target_value ?? ''} onChange={e => setForm(f => ({ ...f, target_value: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
                <input type="number" value={form.current_value ?? 0} onChange={e => setForm(f => ({ ...f, current_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input type="text" value={form.unit || ''} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="km" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3 pt-1">
              {goal?.id && onDelete && (
                <button type="button" onClick={handleDelete} disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
              )}
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [modal, setModal] = useState<{ goal?: GoalData } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.get<GoalData[]>(`/api/goals?year=${year}`);
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, [year]);

  const handleSave = async (data: GoalData) => {
    if (data.id) {
      await api.put(`/api/goals/${data.id}`, data);
    } else {
      await api.post('/api/goals', data);
    }
    await fetchGoals();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/goals/${id}`);
    await fetchGoals();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Goals</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">←</button>
            <span className="text-sm font-semibold text-gray-700 w-12 text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">→</button>
          </div>
        </div>
        <button
          onClick={() => setModal({})}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Goal
        </button>
      </div>

      {loading && <div className="text-center py-8 text-gray-400">Loading…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onClick={() => setModal({ goal })} />
        ))}
        {!loading && goals.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🎯</div>
            <div>No goals for {year}. Add your first goal!</div>
          </div>
        )}
      </div>

      {modal && (
        <GoalFormModal
          goal={modal.goal}
          onSave={handleSave}
          onDelete={modal.goal?.id ? () => handleDelete(modal.goal!.id!) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
