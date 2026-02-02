"use client";

import { ChevronDown, ChevronUp, CheckCircle2, BookOpenText } from "lucide-react";
import { useState } from "react";
import { GrammarItem } from "@/types/lesson";

interface GrammarStepProps {
  grammar: GrammarItem[];
  readGrammar: boolean[];
  setReadGrammar: React.Dispatch<React.SetStateAction<boolean[]>>;
  isReadOnly?: boolean;
}

export function GrammarStep({
  grammar,
  readGrammar,
  setReadGrammar,
  isReadOnly = false,
}: GrammarStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (!readGrammar[index] && !isReadOnly) {
      setReadGrammar((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  };

  const allRead = readGrammar.every(Boolean);
  const readCount = readGrammar.filter(Boolean).length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl space-y-4">
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
            Step 3 · Grammar from the article
          </p>
          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
            These grammar patterns appear in today&apos;s article. Expand each rule to understand how it works.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-[family-name:var(--font-dm-sans)] font-medium uppercase tracking-wide ${
            allRead ? "bg-emerald-100 text-emerald-700" : "bg-primary/20 text-primary"
          }`}>
            {allRead ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                All rules reviewed
              </>
            ) : (
              `${readCount} of ${grammar.length} reviewed`
            )}
          </span>
        </div>

        <div className="space-y-3">
          {grammar.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const isRead = readGrammar[index];

            return (
              <div
                key={index}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  isExpanded
                    ? "border-primary/40 bg-primary/5 shadow-md"
                    : isRead
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-cream-dark bg-white hover:border-primary/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleExpand(index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isRead
                        ? "bg-emerald-500 text-white"
                        : "bg-primary/20 text-primary"
                    }`}>
                      {isRead ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <BookOpenText className="w-4 h-4" />
                      )}
                    </span>
                    <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-foreground">
                      {item.rule}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="pl-10">
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>

                    {item.examples && item.examples.length > 0 && (
                      <div className="pl-10">
                        <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                          Examples from the article
                        </p>
                        <div className="space-y-3">
                          {item.examples.map((example, exIdx) => (
                            <div
                              key={exIdx}
                              className="bg-white/80 rounded-lg px-3 py-3 border border-primary/10 space-y-1.5"
                            >
                              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-800 italic">
                                &ldquo;{example.sentence}&rdquo;
                              </p>
                              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                                → {example.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
