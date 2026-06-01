/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, Landmark, PiggyBank, Sparkles, Trophy } from 'lucide-react';
import { DateEntry } from '../types';
import { formatKSh, getMonthYearLabel } from '../utils';

interface BudgetAnalyticsProps {
  entries: DateEntry[];
}

export default function BudgetAnalytics({ entries }: BudgetAnalyticsProps) {
  const completedEntries = entries
    .filter((e) => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

  // 1. Group custom expenses by Month-Year
  const monthlyTotals: { [key: string]: number } = {};
  completedEntries.forEach((entry) => {
    const label = getMonthYearLabel(entry.date);
    monthlyTotals[label] = (monthlyTotals[label] || 0) + entry.budget;
  });

  const monthlyData = Object.keys(monthlyTotals).map((month) => ({
    month,
    amount: monthlyTotals[month],
  })).sort((a, b) => {
    // Sort chronologically by converting "Month Year" back to date
    return new Date(b.month).getTime() - new Date(a.month).getTime();
  });

  // Calculate generic limits, averages
  const totalCompletedSpend = completedEntries.reduce((acc, curr) => acc + curr.budget, 0);
  const averageSpent = completedEntries.length > 0 ? Math.round(totalCompletedSpend / completedEntries.length) : 0;

  // Find most expensive date
  const mostExpensive = completedEntries.reduce(
    (max, curr) => (curr.budget > (max?.budget || 0) ? curr : max),
    null as DateEntry | null
  );

  // For visual chart scaling
  const maxEntryBudget = completedEntries.length > 0 ? Math.max(...completedEntries.map((e) => e.budget)) : 1;
  const maxMonthAmount = monthlyData.length > 0 ? Math.max(...monthlyData.map((m) => m.amount)) : 1;

  if (completedEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-brand-200 bg-white/50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-brand-50 text-rose-brand-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-700 font-serif">No analytics available yet</h3>
        <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
          Add dates and mark them as <strong>Completed</strong> to see your custom monthly spending, averages, and beautiful date-history chart!
        </p>
      </div>
    );
  }

  return (
    <div id="analytics-section" className="space-y-6">
      {/* Mini Financial Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Average */}
        <div className="flex items-center gap-4 rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Date Cost</p>
            <h4 className="text-lg font-bold text-gray-800">{formatKSh(averageSpent)}</h4>
            <p className="text-[10px] text-gray-500 font-medium">per recorded outing</p>
          </div>
        </div>

        {/* Metric 2: Most Expensive */}
        <div className="flex items-center gap-4 rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lavish Celebration</p>
            <h4 className="text-lg font-bold text-gray-800 truncate" title={mostExpensive?.location}>
              {mostExpensive ? formatKSh(mostExpensive.budget) : 'N/A'}
            </h4>
            <p className="text-[10px] text-gray-400 truncate">
              {mostExpensive ? `@ ${mostExpensive.location}` : 'No dates completed yet'}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Completed */}
        <div className="flex items-center gap-4 rounded-xl border border-warm-beige-200 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-brand-50 text-rose-brand-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget Status</p>
            <h4 className="text-lg font-bold text-gray-800">Healthy Couple Plan</h4>
            <p className="text-[10px] text-gray-500 font-medium">{completedEntries.length} memories finalized</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Summary Box (Left) */}
        <div className="lg:col-span-5 rounded-2xl border border-warm-beige-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-800 mb-4">
            <Landmark className="h-5 w-5 text-rose-brand-400" />
            Monthly Spending
          </h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const pct = (data.amount / maxMonthAmount) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600">{data.month}</span>
                    <span className="font-bold text-gray-800">{formatKSh(data.amount)}</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-warm-beige-100 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-rose-brand-300 to-rose-brand-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Spending Bar Chart (Right) */}
        <div className="lg:col-span-7 rounded-2xl border border-warm-beige-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-800 mb-1">
            <BarChart3 className="h-5 w-5 text-rose-brand-400" />
            Spending Per Date
          </h3>
          <p className="text-xs text-gray-400 mb-4">Detailed chronological expenditure breakdown</p>

          <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
            {completedEntries.map((entry) => {
              const pct = (entry.budget / maxEntryBudget) * 100;
              return (
                <div key={entry.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-warm-beige-100 last:border-b-0">
                  <div className="sm:max-w-[40%]">
                    <h4 className="text-xs font-bold text-gray-700 truncate" title={entry.location}>
                      {entry.location}
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex-1 sm:px-4">
                    <div className="relative h-2.5 w-full rounded-full bg-warm-beige-100 overflow-hidden mt-1 sm:mt-0">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {formatKSh(entry.budget)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
