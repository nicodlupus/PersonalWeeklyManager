import React from 'react';

export interface NoteData {
  id?: number;
  title: string;
  body?: string;
  category?: string;
  pinned?: boolean;
  created_at?: string;
}

interface NoteCardProps {
  note: NoteData;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{note.title}</h3>
        {note.pinned && <span className="text-yellow-500 text-xs shrink-0">📌</span>}
      </div>
      {note.body && (
        <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap">{note.body}</p>
      )}
      {note.category && (
        <span className="mt-2 inline-block text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
          {note.category}
        </span>
      )}
    </button>
  );
}
