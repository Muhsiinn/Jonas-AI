"use client";

import { CheckCircle2, Volume2 } from "lucide-react";
import { VocabItem } from "@/types/lesson";

interface VocabStepProps {
  vocabs: VocabItem[];
  activeVocabIndex: number;
  setActiveVocabIndex: (index: number) => void;
  readVocab: boolean[];
  setReadVocab: React.Dispatch<React.SetStateAction<boolean[]>>;
  speaking: boolean;
  speakText: (text: string) => void;
}

export function VocabStep({
  vocabs,
  activeVocabIndex,
  setActiveVocabIndex,
  readVocab,
  setReadVocab,
  speaking,
  speakText,
}: VocabStepProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl space-y-4">
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
            Step 1 · Vocab for today&apos;s situation
          </p>
          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
            Get familiar with a few key words before you read the story. Tap each word and listen to the
            pronunciation.
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/30 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-[family-name:var(--font-dm-sans)] font-medium uppercase tracking-wide">
                  Word {activeVocabIndex + 1} of {vocabs.length}
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-1">
                {vocabs[activeVocabIndex].term}
              </h3>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700">
                {vocabs[activeVocabIndex].meaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => speakText(vocabs[activeVocabIndex].term)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                speaking
                  ? "bg-primary/80 animate-pulse"
                  : "bg-primary hover:bg-primary/90"
              } text-white`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          {vocabs[activeVocabIndex].example && (
            <div className="bg-white/60 rounded-xl px-4 py-3 border border-primary/10">
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                Example
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-800 italic">
                &ldquo;{vocabs[activeVocabIndex].example}&rdquo;
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {vocabs.map((item, index) => {
            const isActive = index === activeVocabIndex;
            const isRead = readVocab[index];
            return (
              <button
                key={item.term}
                type="button"
                onClick={() => {
                  setActiveVocabIndex(index);
                  setReadVocab((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                  });
                }}
                className={`group relative text-left rounded-xl px-3 py-2.5 border-2 transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary shadow-md scale-[1.02]"
                    : isRead
                    ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                    : "bg-white border-cream-dark hover:border-primary/40 hover:bg-cream/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${
                    isActive
                      ? "bg-primary text-white"
                      : isRead
                      ? "bg-emerald-500 text-white"
                      : "bg-cream-dark text-gray-500"
                  }`}>
                    {isRead ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
                  </span>
                  <span className={`font-[family-name:var(--font-dm-sans)] text-xs truncate ${
                    isActive ? "text-primary font-medium" : "text-foreground"
                  }`}>
                    {item.term}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
