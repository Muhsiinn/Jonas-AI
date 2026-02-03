"use client";

import { Play, AlertCircle } from "lucide-react";
import { RoleplayMessage } from "@/types/roleplay";

interface MessageBubbleProps {
  message: RoleplayMessage;
  onReplay?: () => void;
  speaking?: boolean;
}

export function MessageBubble({ message, onReplay, speaking = false }: MessageBubbleProps) {
  const isAI = message.speaker === "ai";
  const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleReplay = () => {
    if (onReplay) {
      onReplay();
    }
  };

  if (isAI) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <div className="bg-cream-dark rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[80%]">
            {message.hasCorrection && (
              <div className="flex items-center gap-1 mb-2 text-xs text-amber-700">
                <AlertCircle className="w-3 h-3" />
                <span className="font-[family-name:var(--font-dm-sans)] font-medium">Correction</span>
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
