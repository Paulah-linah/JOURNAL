/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Check, Trash2, Undo } from 'lucide-react';
import { DateEntry } from '../types';
import { formatKSh, formatReadableDate, getCategoryStyles } from '../utils';

interface DateCardProps {
  key?: React.Key;
  entry: DateEntry;
  onMarkComplete?: (id: string) => void;
  onMoveToActive?: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DateCard({
  entry,
  onMarkComplete,
  onMoveToActive,
  onDelete,
}: DateCardProps): React.JSX.Element {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const catStyle = getCategoryStyles(entry.category);

  return (
    <div
      id={`date-card-${entry.id}`}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-warm-beige-200 bg-white p-3.5 shadow-sm hover:shadow-[0_12px_24px_rgba(253,244,245,0.5)] transition-all duration-300 group"
    >
      {/* 1. Polaroid Photo Box */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-warm-beige-100 shadow-inner">
        <img
          src={entry.photoUrl}
          alt={entry.location}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Floating Category Tag */}
        <span
          className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md bg-white/90 shadow-sm ${catStyle.color}`}
        >
          <span>{catStyle.icon}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider">{entry.category || 'Date'}</span>
        </span>

        {/* Floating Date Marker over Photo */}
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-xs shadow-sm">
          <Calendar className="h-3 w-3" />
          {formatReadableDate(entry.date)}
        </span>
      </div>

      {/* 2. Content Details (The Polaroid Bottom margin) */}
      <div className="mt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Price */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-lg font-bold text-gray-800 leading-snug group-hover:text-rose-brand-500 transition-colors">
              {entry.location}
            </h4>
            <span className="shrink-0 font-mono text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5">
              {formatKSh(entry.budget)}
            </span>
          </div>

          {/* Sweet Notes */}
          <p className="mt-2 text-xs text-gray-600 font-light leading-relaxed whitespace-pre-line border-l-2 border-rose-brand-100 pl-2">
            {entry.notes || 'This date is waiting for beautiful memories and journals... 💕'}
          </p>
        </div>

        {/* 3. Footer Actions Section */}
        <div className="mt-5 pt-3 border-t border-warm-beige-100">
          {!showConfirmDelete ? (
            <div className="flex items-center justify-between gap-2">
              {/* Left Action: Toggle active vs completed */}
              {entry.completed ? (
                /* History mode item can be marked back to Active optionally */
                onMoveToActive && (
                  <button
                    onClick={() => onMoveToActive(entry.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-150 transition-colors"
                  >
                    <Undo className="h-3.5 w-3.5" />
                    Move back to Planned
                  </button>
                )
              ) : (
                /* Uncompleted date item: complete trigger */
                onMarkComplete && (
                  <button
                    onClick={() => onMarkComplete(entry.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-brand-400 to-rose-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-rose-brand-500 hover:to-rose-brand-600 active:scale-95 transition-all text-center"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Complete
                  </button>
                )
              )}

              {/* Right Action: Trigger delete confirm */}
              <button
                onClick={() => setShowConfirmDelete(true)}
                className={`p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ${entry.completed ? 'ml-auto' : ''}`}
                title="Delete this date"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Confirm Inline Dialog for absolute stability (no window.alerts) */
            <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-2.5 text-center transition-all animate-fadeIn">
              <p className="text-xs font-bold text-rose-700 leading-tight">Delete this beautiful memory permanently?</p>
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 shadow-xs hover:bg-gray-50 cursor-pointer"
                >
                  No, Keep It ❤️
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(entry.id);
                    setShowConfirmDelete(false);
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
