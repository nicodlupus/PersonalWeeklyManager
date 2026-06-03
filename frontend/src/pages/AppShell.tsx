import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import WeekView from '../components/WeekView';
import NotesPage from '../components/NotesPage';
import GoalsPage from '../components/GoalsPage';

type Tab = 'week' | 'notes' | 'goals';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('week');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        {activeTab === 'week' && <WeekView />}
        {activeTab === 'notes' && <NotesPage />}
        {activeTab === 'goals' && <GoalsPage />}
      </main>
    </div>
  );
}
