import React from 'react';
import { useAuth } from '../store/auth';

interface NavbarProps {
  activeTab: 'week' | 'notes' | 'goals';
  setActiveTab: (tab: 'week' | 'notes' | 'goals') => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Top bar */}
      <header className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold tracking-wide">Weekly Manager</h1>
        <div className="flex items-center gap-3">
          <span className="text-indigo-200 text-sm hidden sm:block">Hi, {user?.username}</span>
          <button
            onClick={logout}
            className="text-xs bg-indigo-800 hover:bg-indigo-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Bottom tab bar (mobile) / top nav (desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex sm:static sm:border-t-0 sm:border-b sm:border-gray-200 z-50">
        <button
          onClick={() => setActiveTab('week')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            activeTab === 'week' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Week
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            activeTab === 'notes' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Notes
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            activeTab === 'goals' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Goals
        </button>
      </nav>
    </>
  );
}
