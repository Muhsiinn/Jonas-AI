"use client";

import { useEffect, useState } from "react";
import { NotebookPen, X } from "lucide-react";

const NOTES_STORAGE_KEY = "jonas_global_notes";

export function GlobalNotesWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
  }, [notes]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 rounded-l-xl border border-r-0 border-cream-dark bg-white px-2 py-4 text-xs font-[family-name:var(--font-dm-sans)] text-gray-700 hover:bg-cream-dark/30 transition-colors [writing-mode:vertical-rl] rotate-180 inline-flex items-center gap-1"
          aria-label="Open notes"
        >
          <NotebookPen className="w-4 h-4 rotate-90" />
          Notes
        </button>
      )}

      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-white border-l border-cream-dark flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 py-3 border-b border-cream-dark flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
            Notes
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center rounded-full border border-cream-dark p-1.5 text-gray-600 hover:bg-cream-dark/40 transition-colors"
            aria-label="Close notes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex-1">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Write key phrases, corrections, or ideas anytime..."
            className="w-full h-full resize-none rounded-xl border border-cream-dark bg-cream/30 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </>
  );
}
