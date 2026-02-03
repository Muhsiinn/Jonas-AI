"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config/env";
import {
  roleplaySessionMock,
  messagesMock,
  evaluationMock,
  initialGoalReachedMock,
  initialSessionEndedMock,
  roleplayHistoryMock,
} from "@/mock/roleplay-session";
import { RoleplayMessage, RoleplayHistoryItem } from "@/types/roleplay";
import { formatDate } from "@/lib/utils/format";
import {
  SessionContextCard,
  ConversationPanel,
  InputBar,
  EvaluationPanel,
} from "./components";

export default function RoleplayPage() {
  const { logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [session] = useState(roleplaySessionMock);
  const [messages, setMessages] = useState<RoleplayMessage[]>(messagesMock);
  const [goalReached, setGoalReached] = useState(initialGoalReachedMock);
  const [sessionEnded, setSessionEnded] = useState(initialSessionEndedMock);
  const [evaluation] = useState(evaluationMock);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [roleplayHistory, setRoleplayHistory] = useState<RoleplayHistoryItem[]>(roleplayHistoryMock);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [audioRef] = useState<{ current: HTMLAudioElement | null }>({ current: null });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const speakText = useCallback(async (text: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSpeaking(true);
    setSpeakingMessageId(messageId);
    
    try {
      const apiUrl = getApiBaseUrl();
      const audioUrl = `${apiUrl}${API_ENDPOINTS.AGENTS.TTS}?text=${encodeURIComponent(text)}&lang=de`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setSpeaking(false);
        setSpeakingMessageId(null);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setSpeaking(false);
        setSpeakingMessageId(null);
        audioRef.current = null;
      };
      
      await audio.play();
    } catch {
      setSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, [audioRef]);

  const handleSendMessage = (text: string) => {
    if (sessionEnded) return;

    const newMessage: RoleplayMessage = {
      id: Date.now().toString(),
      speaker: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const aiResponse: RoleplayMessage = {
        id: (Date.now() + 1).toString(),
        speaker: "ai",
        text: "Das ist eine gute Antwort! Können Sie mir mehr Details geben?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFinishSession = () => {
    setSessionEnded(true);
  };

  const handleReplay = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.speaker === "ai") {
      speakText(message.text, messageId);
    }
  };


  const handlePracticeAgain = () => {
    setMessages(messagesMock);
    setSessionEnded(false);
    setGoalReached(false);
    setSelectedSessionId(null);
  };

  const handleNextScenario = () => {
    router.push("/dashboard");
  };

  const handleSelectSession = (sessionId: number) => {
    if (sessionId !== selectedSessionId) {
      setSelectedSessionId(sessionId);
      const selectedSession = roleplayHistory.find((s) => s.id === sessionId);
      if (selectedSession) {
        setSessionEnded(selectedSession.completed);
      }
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

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {!sidebarHidden && (
          <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  Roleplay Sessions
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
                {roleplayHistory.map((item) => {
                  const isSelected = item.id === selectedSessionId;
                  const isToday = formatDate(item.created_at) === "Today";
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSession(item.id)}
                      className={`w-full text-left rounded-2xl border px-3 py-2.5 text-xs font-[family-name:var(--font-dm-sans)] transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-cream-dark bg-white text-foreground hover:bg-cream-dark/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-medium line-clamp-2">{item.title}</span>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.completed ? (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                            {item.score !== null && (
                              <span className="text-[10px] text-gray-500">
                                Score: {item.score}/100
                              </span>
                            )}
                          </>
                        ) : isToday ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                            In progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600">
                            <Lock className="w-3 h-3" />
                            Incomplete
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                
                {roleplayHistory.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No sessions yet
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

          <div className="flex-1 flex overflow-hidden min-w-0">
            <SessionContextCard
              session={session}
              onFinishSession={handleFinishSession}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {sessionEnded ? (
                <EvaluationPanel
                  evaluation={evaluation}
                  onPracticeAgain={handlePracticeAgain}
                  onNextScenario={handleNextScenario}
                />
              ) : (
                <>
                  <ConversationPanel
                    messages={messages}
                    sessionEnded={sessionEnded}
                    onReplay={handleReplay}
                    speaking={speaking}
                    speakingMessageId={speakingMessageId}
                  />
                  <InputBar
                    onSend={handleSendMessage}
                    disabled={sessionEnded}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
