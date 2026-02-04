"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, AlertCircle, BookOpen, Loader2, Volume2 } from "lucide-react";
import { RoleplayMessage } from "@/types/roleplay";
import { apiClient } from "@/lib/api";
import { VocabItem } from "@/types/lesson";

interface MessageBubbleProps {
  message: RoleplayMessage;
  onReplay?: () => void;
  speaking?: boolean;
  onSpeakText?: (text: string) => void;
}

export function MessageBubble({ message, onReplay, speaking = false, onSpeakText }: MessageBubbleProps) {
  const isAI = message.speaker === "ai";
  const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explainResult, setExplainResult] = useState<VocabItem | null>(null);

  const handleReplay = () => {
    if (onReplay) {
      onReplay();
    }
  };

  const handleClickOutside = useCallback(() => {
    setTimeout(() => {
      const selected = window.getSelection();
      if (!selected || selected.toString().trim().length === 0) {
        setSelection(null);
        setExplainResult(null);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (!isAI) return;
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isAI, handleClickOutside]);

  const handleTextSelect = useCallback(() => {
    if (!isAI) return;
    const selected = window.getSelection();
    const selectedText = selected?.toString().trim() ?? "";
    if (!selected || selectedText.length === 0 || selectedText.length >= 100) return;

    try {
      const range = selected.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: selectedText,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
      setExplainResult(null);
    } catch {
      // ignore
    }
  }, [isAI]);

  const handleReadSelection = useCallback(() => {
    if (!selection) return;
    onSpeakText?.(selection.text);
  }, [selection, onSpeakText]);

  const handleExplainSelection = useCallback(async () => {
    if (!selection) return;
    setExplaining(true);
    try {
      const result = await apiClient.explainText(selection.text);
      setExplainResult(result);
    } catch (err) {
      console.error("Failed to explain:", err);
    } finally {
      setExplaining(false);
    }
  }, [selection]);

  if (isAI) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <div
            className="bg-cream-dark rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[80%] relative"
            onMouseUp={handleTextSelect}
            onTouchEnd={handleTextSelect}
          >
            {message.hasCorrection && (
              <div className="flex items-center gap-1 mb-2 text-xs text-amber-700">
                <AlertCircle className="w-3 h-3" />
                <span className="font-[family-name:var(--font-dm-sans)] font-medium">Correction</span>
              </div>
            )}

            {selection && (
              <div
                className="fixed z-50 bg-white rounded-xl shadow-xl border-2 border-cream-dark p-3 min-w-[200px]"
                style={{
                  left: Math.min(Math.max(selection.x, 120), window.innerWidth - 120),
                  top: selection.y,
                  transform: "translateX(-50%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {explainResult ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
                        {explainResult.term}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSpeakText?.(explainResult.term)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                        title="Read"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700">
                      {explainResult.meaning}
                    </p>
                    {explainResult.example && (
                      <div className="bg-cream/50 rounded-lg px-2.5 py-1.5 border border-cream-dark/30">
                        <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-500 mb-0.5">
                          Example
                        </p>
                        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-700 italic">
                          &ldquo;{explainResult.example}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 truncate max-w-[100px]">
                      &ldquo;{selection.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={handleReadSelection}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-[family-name:var(--font-dm-sans)]"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={handleExplainSelection}
                        disabled={explaining}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-[family-name:var(--font-dm-sans)] disabled:opacity-50"
                      >
                        {explaining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5" />
                        )}
                        Meaning
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground whitespace-pre-wrap">
              {message.text}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {isAI && (
                <button
                  type="button"
                  onClick={handleReplay}
                  disabled={speaking}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                    speaking
                      ? "bg-white/40 cursor-not-allowed"
                      : "bg-white/60 hover:bg-white/80"
                  }`}
                  title="Replay"
                >
                  <Play className={`w-3 h-3 ${speaking ? "text-gray-400" : "text-gray-600"}`} />
                  <span className={`font-[family-name:var(--font-dm-sans)] text-[10px] ${speaking ? "text-gray-400" : "text-gray-600"}`}>
                    Replay
                  </span>
                </button>
              )}
              <span className={`font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-500 ${isAI ? "ml-auto" : ""}`}>
                {timeString}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-end gap-3 mb-4">
      <div className="flex-1 flex justify-end">
        <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 inline-block max-w-[80%]">
          {message.hasCorrection && (
            <div className="flex items-center gap-1 mb-2 text-xs text-white/90">
              <AlertCircle className="w-3 h-3" />
              <span className="font-[family-name:var(--font-dm-sans)] font-medium">Correction</span>
            </div>
          )}
          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-white whitespace-pre-wrap">
            {message.text}
          </p>
          <div className="flex items-center justify-end mt-2">
            <span className="font-[family-name:var(--font-dm-sans)] text-[10px] text-white/80">
              {timeString}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
