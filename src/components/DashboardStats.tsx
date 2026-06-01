/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, CheckCircle, Flame, Heart, Wallet } from 'lucide-react';
import { DateEntry } from '../types';
import { formatKSh } from '../utils';

interface DashboardStatsProps {
  entries: DateEntry[];
  onOpenAddForm: () => void;
}

export default function DashboardStats({ entries, onOpenAddForm }: DashboardStatsProps) {
  const completedEntries = entries.filter((e) => e.completed);
  const activeEntries = entries.filter((e) => !e.completed);

  // Calculate total spending for *completed* dates vs total budget of upcoming dates
  const totalCompletedSpend = completedEntries.reduce((acc, curr) => acc + curr.budget, 0);
  const totalUpcomingBudget = activeEntries.reduce((acc, curr) => acc + curr.budget, 0);

  // Calculate dynamic love level/hearts based on completed dates
  const heartsLevel = Math.min(100, completedEntries.length * 5); // 5% per date, max 100%
  const milestoneText =
    completedEntries.length <= 2
      ? 'Just Beginning ❤️'
      : completedEntries.length <= 5
      ? 'Falling Deeper 💕'
      : completedEntries.length <= 10
      ? 'Couples Goals 👑'
      : 'Inseparable Soulmates ♾️';

  return (
    <div id="stats-dashboard" className="space-y-6">
      {/* Dynamic Couple Header / Progress Block */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-brand-400 via-rose-brand-500 to-rose-brand-600 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white opacity-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-rose-brand-300 opacity-20 blur-xl"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 animate-pulse text-amber-300" />
              Love Milestone
            </span>
            <h2 className="mt-2.5 font-serif text-3xl font-semibold tracking-tight">
              {milestoneText}
            </h2>
            <p className="mt-1 text-sm text-rose-brand-100 font-light">
              You've logged {completedEntries.length} beautiful dates together. Here's to many more!
            </p>
          </div>

          <button
            id="quick-add-btn"
            onClick={onOpenAddForm}
            className="self-start md:self-center inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-rose-brand-600 shadow-md transition-all hover:scale-[1.03] hover:shadow-lg active:scale-95"
          >
            <Heart className="h-4.5 w-4.5 fill-rose-brand-500 text-rose-brand-500" />
            Log a New Date
          </button>
        </div>

        {/* Milestone Indicator Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-rose-brand-100 mb-1.5 font-medium">
            <span>Love Journal Mastery</span>
            <span>{completedEntries.length} / 20 Completed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-200 to-white transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(10, Math.min(100, (completedEntries.length / 20) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Grid of Micro-Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Total Completed */}
        <div className="rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-brand-50 text-rose-brand-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold text-gray-800">{completedEntries.length}</h3>
            </div>
          </div>
        </div>

        {/* Stat 2: Total Spent */}
        <div className="rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Spent</p>
              <h3 className="text-xl font-bold text-gray-800 truncate">
                {formatKSh(totalCompletedSpend)}
              </h3>
            </div>
          </div>
        </div>

        {/* Stat 3: Upcoming Dates */}
        <div className="rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</p>
              <h3 className="text-2xl font-bold text-gray-800">{activeEntries.length}</h3>
            </div>
          </div>
        </div>

        {/* Stat 4: Upcoming Budget */}
        <div className="rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Planned Spend</p>
              <h3 className="text-xl font-bold text-gray-800 truncate">
                {formatKSh(totalUpcomingBudget)}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
