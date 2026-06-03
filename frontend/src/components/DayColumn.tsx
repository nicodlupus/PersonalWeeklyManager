import React, { useState } from 'react';
import { EventData } from './EventModal';
import EventCard from './EventCard';
import EventModal from './EventModal';
import MealSection from './MealSection';
import { MealData } from './MealModal';
import { api } from '../api/client';

interface DayColumnProps {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Mon 3"
  isToday: boolean;
  events: EventData[];
  meals: MealData[];
  onRefresh: () => void;
}

export default function DayColumn({ date, label, isToday, events, meals, onRefresh }: DayColumnProps) {
  const [modal, setModal] = useState<{ event?: EventData } | null>(null);

  const handleSave = async (data: EventData) => {
    if (data.id) {
      await api.put(`/api/events/${data.id}`, data);
    } else {
      await api.post('/api/events', data);
    }
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/events/${id}`);
    onRefresh();
  };

  const sorted = [...events].sort((a, b) => {
    if (!a.time_start) return 1;
    if (!b.time_start) return -1;
    return a.time_start.localeCompare(b.time_start);
  });

  return (
    <div className={`flex flex-col min-w-0 ${isToday ? 'bg-indigo-50 rounded-xl' : ''}`}>
      {/* Day header */}
      <div className={`flex items-center justify-between px-2 py-1.5 rounded-t-xl ${isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
        <span className="text-xs font-bold">{label}</span>
        <button
          onClick={() => setModal({})}
          className={`w-5 h-5 flex items-center justify-center rounded-full text-sm leading-none font-bold transition-colors ${isToday ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'}`}
          title="Add event"
        >
          +
        </button>
      </div>

      {/* Events */}
      <div className="flex-1 p-1.5 space-y-1 min-h-[60px]">
        {sorted.map(ev => (
          <EventCard key={ev.id} event={ev} onClick={() => setModal({ event: ev })} />
        ))}
      </div>

      {/* Meals */}
      <div className="px-2 pb-2">
        <MealSection date={date} meals={meals} onRefresh={onRefresh} />
      </div>

      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={date}
          onSave={handleSave}
          onDelete={modal.event?.id ? () => handleDelete(modal.event!.id!) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
