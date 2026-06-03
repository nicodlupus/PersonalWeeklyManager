import React, { useState } from 'react';
import { MealData } from './MealModal';
import MealModal from './MealModal';
import { api } from '../api/client';

interface MealSectionProps {
  date: string;
  meals: MealData[];
  onRefresh: () => void;
}

const MEAL_TYPES: MealData['meal_type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

export default function MealSection({ date, meals, onRefresh }: MealSectionProps) {
  const [modal, setModal] = useState<{ type: MealData['meal_type']; existing?: MealData } | null>(null);

  const handleSave = async (data: MealData) => {
    if (data.id) {
      await api.put(`/api/meals/${data.id}`, data);
    } else {
      await api.post('/api/meals', { ...data, date });
    }
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/meals/${id}`);
    onRefresh();
  };

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Meals</div>
      <div className="space-y-1">
        {MEAL_TYPES.map(type => {
          const meal = meals.find(m => m.meal_type === type);
          return (
            <div key={type} className="flex items-start gap-1">
              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">{MEAL_LABELS[type]}</span>
              {meal ? (
                <button
                  onClick={() => setModal({ type, existing: meal })}
                  className="text-xs text-gray-700 text-left flex-1 hover:text-indigo-600 truncate"
                >
                  {meal.content}
                </button>
              ) : (
                <button
                  onClick={() => setModal({ type })}
                  className="text-xs text-indigo-400 hover:text-indigo-600 font-medium"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <MealModal
          meal={modal.existing}
          defaultDate={date}
          defaultType={modal.type}
          onSave={handleSave}
          onDelete={modal.existing ? () => handleDelete(modal.existing!.id!) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
