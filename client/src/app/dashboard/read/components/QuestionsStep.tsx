"use client";

import { useEffect, useRef } from "react";
import { Question } from "@/lib/api";

interface QuestionsStepProps {
  paragraphs: string[];
  questions: Question[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, value: string) => void;
  articleFontSize: "sm" | "md" | "lg";
  onSaveProgress: () => void;
}

export function QuestionsStep({
  paragraphs,
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  answers,
  onAnswerChange,
  articleFontSize,
  onSaveProgress,
}: QuestionsStepProps) {
  const activeQuestion = questions[activeQuestionIndex];
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const articleTextSizeClass =
    articleFontSize === "sm"
      ? "text-sm"
      : articleFontSize === "md"
      ? "text-base"
      : "text-lg";

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (questionId: number, value: string) => {
    onAnswerChange(questionId, value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onSaveProgress();
    }, 10000);
  };

  const handleMcqSelect = (questionId: number, value: string) => {
    onAnswerChange(questionId, value);
    onSaveProgress();
  };

  const handleNavigation = (newIndex: number) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onSaveProgress();
    setActiveQuestionIndex(newIndex);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">
        <div className="flex-1 space-y-4">
          <div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
              Step 3 · Questions about the story
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
              Use the text on the left as support. Answer each question as best you can — you&apos;ll get a
              score and detailed feedback next.
            </p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 leading-relaxed space-y-4">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={`font-[family-name:var(--font-dm-sans)] ${articleTextSizeClass} text-foreground`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
                Questions
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
                {activeQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const answered = (answers[q.id] ?? "").trim().length > 0;
                const isActive = idx === activeQuestionIndex;
                let classes =
                  "w-7 h-7 rounded-full border text-[11px] font-[family-name:var(--font-dm-sans)] flex items-center justify-center cursor-pointer transition-colors";
                if (isActive) {
                  classes += " border-primary bg-primary text-white";
                } else if (answered) {
                  classes += " border-emerald-200 bg-emerald-50 text-emerald-700";
                } else {
                  classes += " border-cream-dark bg-white text-gray-500";
                }
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={classes}
                    onClick={() => handleNavigation(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
            <p className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground mb-3">
              {activeQuestion.question}
            </p>
            {activeQuestion.type === "mcq" && activeQuestion.options && (
              <div className="space-y-2">
                {activeQuestion.options.map((option, idx) => {
                  const key = `${activeQuestion.id}-${idx}`;
                  const selected = answers[activeQuestion.id] === String(idx);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`w-full text-left rounded-xl border px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] ${
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-cream-dark bg-white text-gray-700"
                      }`}
                      onClick={() => handleMcqSelect(activeQuestion.id, String(idx))}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
            {activeQuestion.type === "short" && (
              <textarea
                className="mt-2 w-full rounded-xl border border-cream-dark px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] text-foreground bg-white"
                rows={4}
                value={answers[activeQuestion.id] ?? ""}
                onChange={(e) => handleTextChange(activeQuestion.id, e.target.value)}
              />
            )}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)] text-xs px-3 py-2 rounded-lg border border-cream-dark text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={activeQuestionIndex === 0}
              onClick={() => handleNavigation(activeQuestionIndex - 1)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)] text-xs px-3 py-2 rounded-lg border border-primary text-white bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300 transition-colors"
              disabled={activeQuestionIndex === questions.length - 1}
              onClick={() => handleNavigation(activeQuestionIndex + 1)}
            >
              Next
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
