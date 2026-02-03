"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config/env";
import { API_ENDPOINTS } from "@/lib/api";
import { RoleplayMessage, RoleplaySession, RoleplayHistoryItem, RoleplayEvaluation } from "@/types/roleplay";
import { RoleplayMessageResponse, RoleplaySessionResponse } from "@/types/api";
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
  
  const [session, setSession] = useState<RoleplaySession | null>(null);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [evaluation, setEvaluation] = useState<RoleplayEvaluation | null>(null);
  const [finishingSession, setFinishingSession] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [roleplayHistory, setRoleplayHistory] = useState<RoleplayHistoryItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [audioRef] = useState<{ current: HTMLAudioElement | null }>({ current: null });
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading roleplay session...");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoadingSession(true);
      setSessionError(null);
      setLoadingMessage("Loading roleplay session...");
      
      try {
        const sessionData = await apiClient.getRoleplaySession();
        setSession({
          title: sessionData.title,
          userRole: sessionData.userRole,
          aiRole: sessionData.aiRole,
          learningGoal: sessionData.learningGoal,
          suggestedVocab: sessionData.suggestedVocab,
        });
      } catch (error: any) {
        if (error.status === 404) {
          const errorMessage = error.message || "";
          // If error mentions "lesson", user needs to create a lesson first
          if (errorMessage.toLowerCase().includes("lesson")) {
            setSessionError("No lesson found for today. Please create a lesson first from the dashboard.");
          } else {
            // Try to create goal if it doesn't exist
            try {
              setLoadingMessage("Creating your personalized roleplay...");
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              setLoadingMessage("Creating your roleplay characters...");
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              setLoadingMessage("Creating plot...");
              await apiClient.createRoleplayGoal();
              
              setLoadingMessage("Finalizing your roleplay session...");
              const sessionData = await apiClient.getRoleplaySession();
              setSession({
                title: sessionData.title,
                userRole: sessionData.userRole,
                aiRole: sessionData.aiRole,
                learningGoal: sessionData.learningGoal,
                suggestedVocab: sessionData.suggestedVocab,
              });
            } catch (createError: any) {
              const createErrorMessage = createError.message || "";
              if (createErrorMessage.toLowerCase().includes("lesson")) {
                setSessionError("No lesson found for today. Please create a lesson first from the dashboard.");
              } else {
                setSessionError(createError instanceof Error ? createError.message : "Failed to create roleplay session");
              }
            }
          }
        } else {
          setSessionError(error instanceof Error ? error.message : "Failed to load session");
        }
      }
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Failed to load session");
    } finally {
      setLoadingSession(false);
      fetchingRef.current = false;
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const messagesData = await apiClient.getRoleplayMessages();
      const formattedMessages: RoleplayMessage[] = messagesData
        .filter((msg) => msg.speaker === "user" || msg.speaker === "ai") // Only show user and AI messages
        .map((msg) => ({
          id: msg.id,
          speaker: msg.speaker as "ai" | "user",
          text: msg.text.trim(), // Clean up text - remove leading/trailing whitespace
          timestamp: new Date(msg.timestamp),
          hasCorrection: msg.hasCorrection || false,
        }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await apiClient.getRoleplayHistory();
      setRoleplayHistory(history);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated && !fetchingRef.current) {
      fetchSession();
      fetchMessages();
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

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

  const handleSendMessage = async (text: string) => {
    if (sessionEnded || !text.trim() || sendingMessage) return;

    const tempUserMessageId = `temp-user-${Date.now()}`;
    const userMessage: RoleplayMessage = {
      id: tempUserMessageId,
      speaker: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSendingMessage(true);

    try {
      const response = await apiClient.sendRoleplayMessage({ user_input: text });
      
      if (!response || !response.reply) {
        throw new Error("No reply received from server");
      }
      
      // Check if evaluation happened (conversation ended)
      if (response.done && response.evaluation) {
        setIsEvaluating(true);
        setEvaluation(response.evaluation);
        setSessionEnded(true);
        await fetchHistory();
        setIsEvaluating(false);
      }
      
      // Clean up the reply - remove leading/trailing whitespace and newlines
      const cleanedReply = response.reply.trim();
      
      // Add AI message optimistically
      const tempAiMessageId = `temp-ai-${Date.now()}`;
      const aiMessage: RoleplayMessage = {
        id: tempAiMessageId,
        speaker: "ai",
        text: cleanedReply,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Fetch messages from backend to get real IDs and ensure consistency
      // Small delay to ensure backend has committed
      setTimeout(async () => {
        await fetchMessages();
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the temporary user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId));
      setIsEvaluating(false);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFinishSession = async () => {
    if (finishingSession || sessionEnded) return;
    
    setFinishingSession(true);
    setIsEvaluating(true);
    try {
      const response = await apiClient.finishRoleplaySession();
      setEvaluation(response.evaluation);
      setSessionEnded(true);
      await fetchHistory();
    } catch (error) {
      console.error("Failed to finish session:", error);
      alert(error instanceof Error ? error.message : "Failed to finish session");
    } finally {
      setFinishingSession(false);
      setIsEvaluating(false);
    }
  };

  const handleReplay = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.speaker === "ai") {
      speakText(message.text, messageId);
    }
  };

  const handlePracticeAgain = () => {
    setMessages([]);
    setSessionEnded(false);
    setGoalReached(false);
    setEvaluation(null);
    setSelectedSessionId(null);
    fetchMessages();
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

  if (loading || loadingSession) {
    return (
      <div className="h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (sessionError) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-red-600 mb-4">
            {sessionError}
          </div>
          <button
            type="button"
            className="font-[family-name:var(--font-dm-sans)] text-sm px-4 py-2 rounded-full border border-primary text-white bg-primary"
            onClick={() => {
              setSessionError(null);
              fetchSession();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
              disabled={finishingSession || sessionEnded}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {sessionEnded && evaluation ? (
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
                    isLoading={sendingMessage}
                    isEvaluating={isEvaluating}
                  />
                  <InputBar
                    onSend={handleSendMessage}
                    disabled={sessionEnded || sendingMessage}
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
