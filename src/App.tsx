/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Calendar, Filter, Heart, HeartHandshake, Plus, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { DateEntry } from './types';
import { SAMPLE_DATES, formatKSh, getMonthYearLabel } from './utils';
import DashboardStats from './components/DashboardStats';
import BudgetAnalytics from './components/BudgetAnalytics';
import DateForm from './components/DateForm';
import DateCard from './components/DateCard';

const STORAGE_KEY = 'our-date-journal-entries';

function mergeStoredEntries(storedEntries: DateEntry[]): DateEntry[] {
  const storedById = new Map(storedEntries.map((entry) => [entry.id, entry]));
  const sampleIds = new Set(SAMPLE_DATES.map((entry) => entry.id));

  const refreshedSamples = SAMPLE_DATES.map((sampleEntry) => {
    const storedEntry = storedById.get(sampleEntry.id);
    if (!storedEntry) {
      return sampleEntry;
    }

    return {
      ...sampleEntry,
      completed: storedEntry.completed,
    };
  });

  const customEntries = storedEntries.filter((entry) => !sampleIds.has(entry.id));

  return [...refreshedSamples, ...customEntries];
}

function loadEntriesFromStorage(): DateEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATES));
    return SAMPLE_DATES;
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return mergeStoredEntries(parsed);
    }
  } catch (error) {
    console.error('Failed to parse stored entries', error);
  }

  return SAMPLE_DATES;
}

export default function App() {
  const [entries, setEntries] = useState<DateEntry[]>(() => loadEntriesFromStorage());
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'analytics'>('active');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'budget-desc' | 'budget-asc'>('date-desc');

  // Load from local storage or set defaults on initial mount
  useEffect(() => {
    const syncFromStorage = () => {
      setEntries(loadEntriesFromStorage());
    };

    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncFromStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  // Save to local storage whenever state changes
  const saveToStorage = (newEntries: DateEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  // Add a new entry
  const handleAddEntry = (newEntry: Omit<DateEntry, 'id' | 'completed'>) => {
    const entry: DateEntry = {
      ...newEntry,
      id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false, // Goes to Active outings first
    };

    const updated = [entry, ...entries];
    saveToStorage(updated);
    setActiveTab('active'); // Switch view tab to active to highlight addition
    setShowAddForm(false);
  };

  // Mark an entry as completed
  const handleMarkComplete = (id: string) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, completed: true };
      }
      return entry;
    });
    saveToStorage(updated);
  };

  // Move a completed entry back to planned
  const handleMoveToActive = (id: string) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, completed: false };
      }
      return entry;
    });
    saveToStorage(updated);
  };

  // Delete an entry permanently
  const handleDelete = (id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    saveToStorage(updated);
  };

  // Extract unique Month/Year labels from completed entries to populate Month Filter dropdown
  const uniqueMonths = (Array.from(
    new Set(
      entries
        .filter((e) => e.completed)
        .map((e) => getMonthYearLabel(e.date))
        .filter((label): label is string => !!label)
    )
  ) as string[]).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime()); // Newest month-year first

  // Filter and sort the entries based on user selection
  const getProcessedEntries = () => {
    // 1. Separate by completion status based on currently viewed sub-section
    const targetStatus = activeTab === 'history';
    let list = entries.filter((entry) => entry.completed === targetStatus);

    // 2. Search filter (by Location or Notes text)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.location.toLowerCase().includes(q) ||
          e.notes.toLowerCase().includes(q) ||
          (e.category && e.category.toLowerCase().includes(q))
      );
    }

    // 3. Month filter (relevant only for completed entries)
    if (activeTab === 'history' && monthFilter !== 'all') {
      list = list.filter((e) => getMonthYearLabel(e.date) === monthFilter);
    }

    // 4. Sorting logic
    list.sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOrder === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortOrder === 'budget-desc') {
        return b.budget - a.budget;
      } else if (sortOrder === 'budget-asc') {
        return a.budget - b.budget;
      }
      return 0;
    });

    return list;
  };

  const processedList = getProcessedEntries();
  const activeEntriesCount = entries.filter((e) => !e.completed).length;
  const completedEntriesCount = entries.filter((e) => e.completed).length;

  return (
    <div className="min-h-screen pb-16 bg-[#FDFBF7]">
      {/* 1. Brand Greeting Header */}
      <header className="sticky top-0 z-40 border-b border-rose-brand-100 bg-white/85 backdrop-blur-md px-4 py-4.5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-brand-100 text-rose-brand-500 animate-pulse">
              <HeartHandshake className="h-5 w-5 fill-rose-brand-400 text-rose-brand-500" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                Our Date Journal <span className="text-rose-brand-500">❤️</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400">
                Capturing every romantic adventure and budget step together
              </p>
            </div>
          </div>

          <button
            id="header-create-btn"
            onClick={() => {
              setShowAddForm(true);
              // Smooth scroll to form container
              window.scrollTo({ top: 320, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF8A95] hover:bg-[#FF7382] text-white px-4 py-2.5 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Date</span>
          </button>
        </div>
      </header>

      {/* 2. Main Container Workspace */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Dynamic Stats Dashboard Display */}
        <DashboardStats
          entries={entries}
          onOpenAddForm={() => {
            setShowAddForm(true);
            window.scrollTo({ top: 320, behavior: 'smooth' });
          }}
        />

        {/* 3. Dropdown/Logged Date Drawer Form */}
        {showAddForm && (
          <div className="relative animate-slideDown overflow-visible">
            <DateForm
              onAddEntry={handleAddEntry}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* 4. Tab Navigation and Filtering Hub */}
        <div className="bg-white rounded-2xl border border-warm-beige-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* View Tab Segment Control */}
            <div className="inline-flex rounded-xl bg-warm-beige-100 p-1 self-start">
              <button
                id="tab-active"
                onClick={() => {
                  setActiveTab('active');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'active'
                    ? 'bg-rose-brand-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Planned Outings
                <span
                  className={`inline-flex rounded-full h-4.5 min-w-4.5 px-1 items-center justify-center text-[10px] font-bold ${
                    activeTab === 'active' ? 'bg-white text-rose-brand-600' : 'bg-warm-beige-200 text-gray-600'
                  }`}
                >
                  {activeEntriesCount}
                </span>
              </button>

              <button
                id="tab-history"
                onClick={() => {
                  setActiveTab('history');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'history'
                    ? 'bg-rose-brand-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Past Memories
                <span
                  className={`inline-flex rounded-full h-4.5 min-w-4.5 px-1 items-center justify-center text-[10px] font-bold ${
                    activeTab === 'history' ? 'bg-white text-rose-brand-600' : 'bg-warm-beige-200 text-gray-600'
                  }`}
                >
                  {completedEntriesCount}
                </span>
              </button>

              <button
                id="tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-rose-brand-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Love Analytics
              </button>
            </div>

            {/* Quick search/sort stats */}
            {activeTab !== 'analytics' && (
              <span className="text-xs text-gray-400 font-medium hidden md:inline">
                Showing {processedList.length} of {activeTab === 'active' ? activeEntriesCount : completedEntriesCount} entries
              </span>
            )}
          </div>

          {/* Filters Bar: Only rendered for List Views (Planned and Past) */}
          {activeTab !== 'analytics' && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-warm-beige-100">
              {/* Text Search Input (Col: 5) */}
              <div className="sm:col-span-5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Query location, notes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-warm-beige-200 bg-warm-beige-50/50 pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Month Dropdown filter (Col: 3, rendered only in Past memories timeline) */}
              {activeTab === 'history' ? (
                <div className="sm:col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Filter className="h-3.5 w-3.5" />
                  </span>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full rounded-xl border border-warm-beige-200 bg-warm-beige-50/50 pl-8 pr-3 py-2 text-xs text-gray-700 focus:bg-white focus:outline-none appearance-none transition-colors"
                  >
                    <option value="all">📅 All Months</option>
                    {uniqueMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sm:col-span-3 text-xs text-gray-400 flex items-center pl-1 font-medium">
                  {/* Decorative guide spacer for symmetrical layout in active tab */}
                  <span>🌱 Tracking future memory paths</span>
                </div>
              )}

              {/* Chronological/Budget Sort Order (Col: 4) */}
              <div className="sm:col-span-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full rounded-xl border border-warm-beige-200 bg-warm-beige-50/50 pl-8 pr-3 py-2 text-xs text-gray-700 focus:bg-white focus:outline-none appearance-none transition-colors"
                >
                  <option value="date-desc">📅 Newest Date first</option>
                  <option value="date-asc">📅 Oldest Date first</option>
                  <option value="budget-desc">💰 Budget: High to Low</option>
                  <option value="budget-asc">💰 Budget: Low to High</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 5. Applet Sections Viewer */}
        <div id="tab-content">
          {activeTab === 'analytics' ? (
            <BudgetAnalytics entries={entries} />
          ) : (
            <>
              {processedList.length === 0 ? (
                /* Empty state container */
                <div className="rounded-2xl border border-dashed border-warm-beige-300 bg-white/40 p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-brand-50 text-[#FF8A95] animate-bounce">
                    <Heart className="h-6 w-6 fill-[#FF8A95]" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-gray-700">No date memories located</h3>
                  <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                    {searchQuery || monthFilter !== 'all'
                      ? "We couldn't find any matches matching your query. Adjust your filters or browse overall logs!"
                      : activeTab === 'active'
                      ? "You don't have any planned dates pending. Take the lead, open the form, and program a sweet outing together!"
                      : "No completed memory entries recorded yet. Tap checkmark tags on your outings to log them in your memory footprint forever!"}
                  </p>
                  {(searchQuery || monthFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setMonthFilter('all');
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-brand-600 shadow-xs hover:bg-rose-brand-50 cursor-pointer"
                    >
                      Clear Active Queries
                    </button>
                  )}
                </div>
              ) : (
                /* Grid list of entries */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {processedList.map((entry) => (
                    <DateCard
                      key={entry.id}
                      entry={entry}
                      onMarkComplete={activeTab === 'active' ? handleMarkComplete : undefined}
                      onMoveToActive={activeTab === 'history' ? handleMoveToActive : undefined}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Sweet couple foot banner */}
      <footer className="mt-12 text-center text-xs text-gray-400 font-medium">
        <p>Created with Love & Devotion 💕</p>
        <p className="mt-1 text-[10px]">Your relationship history is fully secured locally in this browser.</p>
      </footer>
    </div>
  );
}
