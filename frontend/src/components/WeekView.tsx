import React, { useState, useEffect, useCallback } from 'react';
import DayColumn from './DayColumn';
import { EventData } from './EventModal';
import { MealData } from './MealModal';
import { api } from '../api/client';

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function WeekView() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [events, setEvents] = useState<EventData[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = weekDays[6];
  const today = toISODate(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const from = toISODate(weekStart);
      const to = toISODate(weekEnd);
      const [evs, mls] = await Promise.all([
        api.get<EventData[]>(`/api/events?from=${from}&to=${to}`),
        api.get<MealData[]>(`/api/meals?from=${from}&to=${to}`),
      ]);
      setEvents(evs);
      setMeals(mls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  const startMonth = MONTHS[weekStart.getMonth()];
  const endMonth = MONTHS[weekEnd.getMonth()];
  const monthLabel = startMonth === endMonth
    ? `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    : `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        >
          ←
        </button>
        <div className="text-center">
          <div className="font-semibold text-gray-800 text-sm">Week of {monthLabel}</div>
          <button onClick={goToday} className="text-xs text-indigo-500 hover:underline mt-0.5">Today</button>
        </div>
        <button
          onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        >
          →
        </button>
      </div>

      {loading && (
        <div className="text-center py-2 text-xs text-indigo-500 animate-pulse">Loading…</div>
      )}

      {/* 7-day grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 p-2 min-w-[560px] h-full">
          {weekDays.map((day, i) => {
            const dateStr = toISODate(day);
            const dayEvents = events.filter(e => e.date === dateStr || (e.date as string).startsWith(dateStr));
            const dayMeals = meals.filter(m => m.date === dateStr || (m.date as string).startsWith(dateStr));
            return (
              <DayColumn
                key={dateStr}
                date={dateStr}
                label={`${DAY_NAMES[i]} ${day.getDate()}`}
                isToday={dateStr === today}
                events={dayEvents}
                meals={dayMeals}
                onRefresh={fetchData}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
