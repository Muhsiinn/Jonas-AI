"use client";

import { useState } from "react";

interface WritingEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function WritingEditor({ value, onChange, disabled = false }: WritingEditorProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-2 border-cream-dark overflow-hidden">
      <div className="px-6 py-4 border-b border-cream-dark">
        <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
          Write your response in German
        </p>
      </div>
      <div className="px-6 py-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Start writing your response in German here..."
          className={`w-full min-h-[300px] font-[family-name:var(--font-dm-sans)] text-sm text-foreground placeholder:text-gray-400 bg-transparent border-none outline-none resize-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
      <div className="px-6 py-3 border-t border-cream-dark bg-cream/30">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 text-right">
          {value.length} {value.length === 1 ? "character" : "characters"}
        </p>
      </div>
    </div>
  );
}
