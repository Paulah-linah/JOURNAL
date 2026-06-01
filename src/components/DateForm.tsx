/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { CATEGORIES, compressImage } from '../utils';

interface DateFormProps {
  onAddEntry: (entry: {
    date: string;
    location: string;
    budget: number;
    notes: string;
    category: string;
    photoUrl?: string;
  }) => void;
  onClose: () => void;
}

export default function DateForm({ onAddEntry, onClose }: DateFormProps) {
  // Form values
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [category, setCategory] = useState<string>('Dinner');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Default romantic unsplash categories fallback in case they don't upload a custom photo
  const categoryCovers: { [key: string]: string } = {
    Dinner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
    Movie: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600',
    Adventure: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600',
    Outdoor: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
    Coffee: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
    Concert: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600',
    Relax: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600',
  };

  // Image upload handling
  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMsg('');
    try {
      // Compress the image immediately so it easily fits under 5MB localStorage budget
      const base64Data = await compressImage(file, 600, 450);
      setPhotoUrl(base64Data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process/compress the selected image. Try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Drag over handler
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Drop handler
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    setIsCompressing(true);
    setErrorMsg('');
    try {
      const base64Data = await compressImage(file, 600, 450);
      setPhotoUrl(base64Data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not compress the image. Please try uploading again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      setErrorMsg('Please enter a location name (e.g., IMAX Garden City).');
      return;
    }

    const parsedBudget = parseFloat(budget.replace(/[^0-9]/g, ''));
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setErrorMsg('Please enter a valid spent/estimated budget (KSh).');
      return;
    }

    // If they haven't uploaded an image, assign a beautiful premade Unsplash cover matching their selected category
    const finalPhotoUrl = photoUrl || categoryCovers[category] || categoryCovers.Dinner;

    onAddEntry({
      date,
      location: location.trim(),
      budget: parsedBudget,
      notes: notes.trim(),
      category,
      photoUrl: finalPhotoUrl,
    });

    onClose();
  };

  return (
    <div className="rounded-2xl border border-rose-brand-100 bg-white p-6 shadow-xl relative">
      {/* Absolute Header close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close logger"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-rose-brand-500" />
        <h3 className="font-serif text-xl font-bold text-gray-800">Plan or Log a New Date</h3>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. IMAX Garden City, Talisman Restaurant"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm rounded-xl border border-warm-beige-200 bg-warm-beige-50 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Date of Outing *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm rounded-xl border border-warm-beige-200 bg-warm-beige-50 px-4 py-3 text-gray-800 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget Input (KSh) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Budget / Cost (KSh) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                KSh
              </span>
              <input
                type="text"
                pattern="[0-9]*"
                required
                placeholder="e.g. 5500"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-sm rounded-xl border border-warm-beige-200 bg-warm-beige-50 pl-14 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm rounded-xl border border-warm-beige-200 bg-warm-beige-50 px-4 py-3 text-gray-800 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area for Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Notes & Sweet Memories</label>
          <textarea
            rows={2}
            placeholder="Write down details! Who picked the restaurant? What was the funniest moment? 🌸"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm rounded-xl border border-warm-beige-200 bg-warm-beige-50 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-rose-brand-300 focus:bg-white focus:outline-none transition-colors resize-none"
          ></textarea>
        </div>

        {/* Photo Upload Zone */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Date Portrait (Photo)</label>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Action buttons (left/center) */}
            <div className="sm:col-span-8">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="group border border-dashed border-warm-beige-300 rounded-xl bg-warm-beige-50/50 hover:bg-white hover:border-rose-brand-300 transition-all p-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                onClick={() => fileInputRef.current?.click()}
              >
                {isCompressing ? (
                  <div className="space-y-2">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-rose-brand-300 border-t-rose-brand-600"></div>
                    <span className="text-xs font-semibold text-gray-500">Compressing memory...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-brand-50 text-rose-brand-500 group-hover:scale-105 transition-transform">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">Drag photo here, or browse files</p>
                    <p className="text-[10px] text-gray-400">Supports JPG, PNG (Auto-compressed for storage)</p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFile}
                className="hidden"
              />

              {/* Camera capture triggers explicitly for mobile phones */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">Or snap directly:</span>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-brand-600 shadow-sm hover:bg-rose-brand-50 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Launch Camera
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* Preview portrait card (right) */}
            <div className="sm:col-span-4 flex items-center justify-center border border-warm-beige-200 rounded-xl bg-warm-beige-100 overflow-hidden relative group min-h-[140px]">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt="Memory preview"
                    className="h-full w-full object-cover max-h-[140px]"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-brand-400 block mb-1">
                    Romantic Cover
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    Category standard photo will be automatically set if none uploaded!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button layout */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-warm-beige-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-warm-beige-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-warm-beige-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCompressing}
            className="rounded-xl bg-[#FF8A95] hover:bg-[#FF7382] disabled:bg-gray-300 text-white font-semibold text-sm px-6 py-3 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            Create Date Memory 💕
          </button>
        </div>
      </form>
    </div>
  );
}
