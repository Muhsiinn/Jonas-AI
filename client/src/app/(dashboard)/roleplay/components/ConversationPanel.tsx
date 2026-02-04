"use client";

import { useEffect, useRef } from "react";
import { RoleplayMessage } from "@/types/roleplay";
import { MessageBubble } from "./MessageBubble";
import { CheckCircle2 } from "lucide-react";

interface ConversationPanelProps {
  messages: RoleplayMessage[];
  sessionEnded: boolean;
  onReplay?: (messageId: string) => void;
  speaking?: boolean;
  speakingMessageId?: string | null;
  isLoading?: boolean;
  isEvaluating?: boolean;
  onSpeakText?: (text: string) => void;
}

export function ConversationPanel({
  messages,
  sessionEnded,
  onReplay,
  speaking = false,
  speakingMessageId = null,
  isLoading = false,
  isEvaluating = false,
  onSpeakText,
}: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-cream p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReplay={() => onReplay?.(message.id)}
            speaking={speaking && speakingMessageId === message.id}
            onSpeakText={onSpeakText}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="bg-cream-dark rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500">AI is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="bg-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[80%] border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-[family-name:var(--font-dm-sans)] text-xs text-primary font-medium">Evaluating...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {sessionEnded && (
          <div className="bg-white rounded-2xl border-2 border-primary/30 p-6 mt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                Session Completed
              </h3>
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
              Great job! You've completed this roleplay session. Check your evaluation below.
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
