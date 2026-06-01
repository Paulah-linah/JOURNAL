/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DateEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  location: string;   // e.g. "IMAX Garden City"
  notes: string;      // description/notes
  budget: number;     // in Kenyan Shillings
  completed: boolean; // active vs history
  photoUrl?: string;  // Base64 compressed image or cover key
  category?: string;  // e.g. "Dinner", "Movie", "Outdoor", "Concert", etc.
}

export interface MonthlySpend {
  month: string;      // e.g., "July 2026"
  amount: number;
}
