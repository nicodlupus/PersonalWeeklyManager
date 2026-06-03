import React, { useState, useEffect } from 'react';
import NoteCard, { NoteData } from './NoteCard';
import { api } from '../api/client';

interface NoteModal {
  note?: NoteData;
}

function NoteFormModal({ note, onSave, onDelete, onClose }: {
  note?: NoteData;
  onSave: (data: NoteData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<NoteData>({ title: '', body: '', category: '', pinned: false, ...note });
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
    if (!onDelete || !confirm('Delete note?')) return;
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
            <h2 className="text-xl font-bold text-gray-800">{note?.id ? 'Edit Note' : 'New Note'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea rows={5} value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Ideas" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.pinned || false} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Pin note</span>
                </label>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3 pt-1">
              {note?.id && onDelete && (
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

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [modal, setModal] = useState<NoteModal | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.get<NoteData[]>('/api/notes');
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async (data: NoteData) => {
    if (data.id) {
      await api.put(`/api/notes/${data.id}`, data);
    } else {
      await api.post('/api/notes', data);
    }
    await fetchNotes();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/notes/${id}`);
    await fetchNotes();
  };

  const categories = Array.from(new Set(notes.map(n => n.category).filter(Boolean)));
  const filtered = filter ? notes.filter(n => n.category === filter) : notes;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notes</h2>
        <button
          onClick={() => setModal({})}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Note
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('')}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat!)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="text-center py-8 text-gray-400">Loading…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(note => (
          <NoteCard key={note.id} note={note} onClick={() => setModal({ note })} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <div>No notes yet. Create your first note!</div>
          </div>
        )}
      </div>

      {modal && (
        <NoteFormModal
          note={modal.note}
          onSave={handleSave}
          onDelete={modal.note?.id ? () => handleDelete(modal.note!.id!) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
