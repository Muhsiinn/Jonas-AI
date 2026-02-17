"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { TeacherChat } from "./TeacherChat";
import { TeacherMessage } from "@/types/teacher";
import { apiClient } from "@/lib/api";

export function TeacherWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (hasFetched) return;
    
    setLoadingMessages(true);
    try {
      const fetchedMessages = await apiClient.getTeacherMessages();
      setMessages(
        fetchedMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.timestamp,
        }))
      );
      setHasFetched(true);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [hasFetched]);

  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchMessages();
    }
  }, [isOpen, hasFetched, fetchMessages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const tempUserMessage: TeacherMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.sendTeacherMessage({ message: text });
      
      const aiMessage: TeacherMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
        return [...filtered, aiMessage];
      });

      setTimeout(async () => {
        setHasFetched(false);
        await fetchMessages();
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (pathname.startsWith("/teacher")) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center z-50 hover:scale-110"
        title="Open German Teacher"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-10 right-6 z-50 transition-all ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-cream-dark flex flex-col h-full overflow-hidden">
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-[family-name:var(--font-fraunces)] text-base font-bold">
              German Teacher
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex-1 min-h-0">
            {loadingMessages ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <TeacherChat
                messages={messages}
                onSend={handleSend}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
