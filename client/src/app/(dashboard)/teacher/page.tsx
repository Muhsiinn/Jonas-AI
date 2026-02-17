"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { TeacherMessage, TeacherHistoryItem } from "@/types/teacher";
import { TeacherChat } from "@/components/common/TeacherChat";
import { ChevronLeft, ChevronRight, Calendar, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export default function TeacherPage() {
  const { logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [teacherHistory, setTeacherHistory] = useState<TeacherHistoryItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await apiClient.getTeacherHistory();
      setTeacherHistory(history);
      if (history.length > 0 && selectedConversationId === null) {
        const todayConversation = history.find(item => formatDate(item.created_at) === "Today");
        if (todayConversation) {
          setSelectedConversationId(todayConversation.id);
        } else {
          setSelectedConversationId(history[0].id);
        }
      } else if (history.length === 0) {
        setLoadingMessages(false);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, [selectedConversationId]);

  const fetchMessages = useCallback(async (conversationId?: number) => {
    try {
      setLoadingMessages(true);
      let fetchedMessages;
      
      if (conversationId) {
        fetchedMessages = await apiClient.getTeacherMessagesByConversation(conversationId);
      } else {
        fetchedMessages = await apiClient.getTeacherMessages();
      }
      
      setMessages(
        fetchedMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.timestamp,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchHistory();
    }
  }, [loading, isAuthenticated, fetchHistory]);

  useEffect(() => {
    if (selectedConversationId !== null) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

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
        await fetchMessages(selectedConversationId || undefined);
        await fetchHistory();
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSelectConversation = (conversationId: number) => {
    if (conversationId !== selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
  };

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {!sidebarHidden && (
          <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  Chat History
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-cream-dark/80 px-2 py-0.5 text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600 hover:bg-cream-dark/40 transition-colors"
                  onClick={() => setSidebarHidden(true)}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Hide
                </button>
              </div>
              
              <div className="space-y-2">
                {teacherHistory.map((item) => {
                  const isSelected = item.id === selectedConversationId;
                  const isToday = formatDate(item.created_at) === "Today";
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectConversation(item.id)}
                      className={`w-full text-left rounded-2xl border px-3 py-2.5 text-xs font-[family-name:var(--font-dm-sans)] transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-cream-dark bg-white text-foreground hover:bg-cream-dark/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-medium">
                          {isToday ? "Today's Chat" : `Chat ${formatDate(item.created_at)}`}
                        </span>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-primary/10 text-primary border border-primary/20">
                          <MessageCircle className="w-3 h-3" />
                          {item.message_count} {item.message_count === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </button>
                  );
                })}
                
                {teacherHistory.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No conversations yet
                  </p>
                )}
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {sidebarHidden && (
            <div className="bg-white border-b border-cream-dark px-3 py-2 flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-cream-dark/80 px-2 py-0.5 text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600 hover:bg-cream-dark/40 transition-colors"
                onClick={() => setSidebarHidden(false)}
              >
                <ChevronRight className="w-3 h-3" />
                Show history
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-cream-dark px-6 py-4 shrink-0">
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground">
                German Teacher
              </h1>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mt-1">
                Ask questions about grammar, vocabulary, or anything related to learning German
              </p>
            </div>

            <div className="flex-1 min-h-0">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <TeacherChat
                  messages={messages}
                  onSend={handleSend}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
