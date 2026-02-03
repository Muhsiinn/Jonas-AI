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
}

export function ConversationPanel({
  messages,
  sessionEnded,
  onReplay,
  speaking = false,
  speakingMessageId = null,
}: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-cream p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReplay={() => onReplay?.(message.id)}
            speaking={speaking && speakingMessageId === message.id}
          />
        ))}
        
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
