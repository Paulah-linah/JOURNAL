/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateEntry } from './types';

// Helper to format currency in Kenyan Shillings
export function formatKSh(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Format date to a readable form e.g. "June 14, 2026" or "June 2026"
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Extract Month and Year (e.g. "June 2026")
export function getMonthYearLabel(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Other';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// Client-side image compression using canvas
// Resizes the image and lowers JPEG quality so users can keep many memories in LocalStorage (max 5MB limit)
export function compressImage(file: File, maxWidth = 600, maxHeight = 450): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and clamp to max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas contextual recovery failed'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Sample initial dates to enrich user onboarding and showcase features immediately
export const SAMPLE_DATES: DateEntry[] = [
  {
    id: 'sample-1',
    date: '2026-05-12',
    location: 'Karura Forest Reserve',
    notes: 'Walked along the waterfall trail, rented bicycles and raced through the clay paths. Ended the afternoon with hot chocolate at the River Café! 🌲🚴‍♀️',
    budget: 3500,
    completed: true,
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
    category: 'Adventure',
  },
  {
    id: 'sample-2',
    date: '2026-05-24',
    location: 'Talisman Restaurant, Karen',
    notes: 'Super romantic candlelit dinner by the fireplace. Tried the sushi, coriander feta samosas, and chocolate fondant. A perfect anniversary dinner!',
    budget: 8500,
    completed: true,
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
    category: 'Dinner',
  },
  {
    id: 'sample-3',
    date: '2026-06-14',
    location: 'IMAX Garden City Mall',
    notes: 'Going to watch the new Sci-fi blockubuster in 3D! Grabbing popcorn, hotdogs and giant slushies before heading in. 🍿🎬',
    budget: 2400,
    completed: false,
    photoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600',
    category: 'Movie',
  },
  {
    id: 'sample-4',
    date: '2026-06-28',
    location: 'Nairobi National Park - Morning Safari',
    notes: 'Planning an early morning drive to catch lions and rhinos roaming. Bringing a picnic hamper filled with custom croissants, strawberries, and coffee. ☕🦁',
    budget: 7200,
    completed: false,
    photoUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600',
    category: 'Outdoor',
  }
];

export const CATEGORIES = [
  { name: 'Dinner', icon: '🍽️', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { name: 'Movie', icon: '🎬', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Adventure', icon: '🚴', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'Outdoor', icon: '🌿', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Coffee', icon: '☕', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { name: 'Concert', icon: '🎵', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { name: 'Relax', icon: '💆', color: 'bg-purple-50 text-purple-600 border-purple-100' },
];

export function getCategoryStyles(categoryName?: string) {
  const found = CATEGORIES.find(c => c.name === categoryName);
  return found || { name: 'Date', icon: '💖', color: 'bg-rose-brand-50 text-rose-brand-600 border-rose-brand-100' };
}
