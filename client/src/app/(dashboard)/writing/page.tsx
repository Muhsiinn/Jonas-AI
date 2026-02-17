"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { apiClient } from "@/lib/api";
import { WritingEvaluationResponse, WritingHistoryItem } from "@/types/writing";
import { PremiumGuard } from "@/components/common/PremiumGuard";
import { GoalCard, WritingEditor, EvaluationPanel } from "./components";
import { Loader2, ChevronLeft, ChevronRight, Calendar, CheckCircle2, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export default function WritingPage() {
  const { logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [goal, setGoal] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [evaluation, setEvaluation] = useState<WritingEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);
  const [selectedWritingId, setSelectedWritingId] = useState<number | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setChecking(false);
      fetchGoalAndHistory();
    }
  }, [authLoading, isAuthenticated]);

  const fetchGoalAndHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalResponse, historyResponse] = await Promise.all([
        apiClient.createWritingGoal(),
        apiClient.getWritingHistory(),
      ]);

      setGoal(goalResponse.goal);
      setHistory(historyResponse);

      const todayItem = historyResponse.find(
        (item) => formatDate(item.created_at) === "Today"
      );
      if (todayItem) {
        setSelectedWritingId(todayItem.id);
      } else if (historyResponse.length > 0) {
        setSelectedWritingId(historyResponse[0].id);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load writing goal";
      if (err.status === 404) {
        setError("No daily situation found for today. Please create one first from the dashboard.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedWriting = useMemo(
    () => history.find((item) => item.id === selectedWritingId) || null,
    [history, selectedWritingId]
  );

  const isTodaySelected = useMemo(
    () =>
      selectedWriting ? formatDate(selectedWriting.created_at) === "Today" : true,
    [selectedWriting]
  );

  const isTodayCompleted = useMemo(
    () => Boolean(isTodaySelected && selectedWriting?.completed),
    [isTodaySelected, selectedWriting]
  );

  const currentUserText = useMemo(
    () => selectedWriting?.user_input ?? userInput,
    [selectedWriting, userInput]
  );

  const handleSubmit = async () => {
    if (!userInput.trim() || evaluating) return;

    try {
      setEvaluating(true);
      setError(null);
      const response = await apiClient.evaluateWriting({ user_input: userInput });
      setEvaluation(response);

      const updatedHistory = await apiClient.getWritingHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to evaluate writing";
      setError(errorMessage);
    } finally {
      setEvaluating(false);
    }
  };

  if (authLoading || checking || loading) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-primary/5">
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <Loader2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground">
            Loading your writing goal
          </h2>
        </div>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="font-[family-name:var(--font-dm-sans)] text-red-600 mb-4">
            {error}
          </div>
          <button
            type="button"
            className="font-[family-name:var(--font-dm-sans)] text-sm px-4 py-2 rounded-full border border-primary text-white bg-primary"
            onClick={fetchGoalAndHistory}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PremiumGuard>
      <div className="h-screen bg-cream flex flex-col overflow-hidden">
        <Navbar onLogout={logout} />

        <div className="flex-1 flex overflow-hidden">
          {!sidebarHidden && (
            <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                    Writing Sessions
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
                  {history.map((item) => {
                    const isSelected = item.id === selectedWritingId;
                    const isToday = formatDate(item.created_at) === "Today";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedWritingId(item.id)}
                        className={`w-full text-left rounded-2xl border px-3 py-2.5 text-xs font-[family-name:var(--font-dm-sans)] transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-cream-dark bg-white text-foreground hover:bg-cream-dark/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-medium line-clamp-2">{item.goal}</span>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.completed ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          ) : isToday ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                              In progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600">
                              <Lock className="w-3 h-3" />
                              Not written
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {history.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No writing goals yet
                    </p>
                  )}
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1 flex flex-col overflow-hidden">
            {sidebarHidden && (
              <div className="bg-white border-b border-cream-dark px-3 py-2 flex items-center gap-2">
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

            <div className="bg-white border-b border-cream-dark px-8 py-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-wide text-gray-500">
                      {evaluation && isTodaySelected
                        ? "Writing evaluation"
                        : isTodaySelected
                        ? isTodayCompleted
                          ? "Today's writing completed"
                          : "Write in German"
                        : "Review past goal"}
                    </p>
                    {(!isTodaySelected || isTodayCompleted) && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-[family-name:var(--font-dm-sans)] bg-gray-100 text-gray-600 border border-gray-200">
                        <Lock className="w-3 h-3" />
                        Read only
                      </span>
                    )}
                  </div>
                  <h1 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                    {evaluation && isTodaySelected
                      ? "Your results"
                      : isTodaySelected
                      ? "Daily writing practice"
                      : "Writing history"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {goal && isTodaySelected && !evaluation && !isTodayCompleted && (
                <>
                  <GoalCard goal={goal} />
                  <WritingEditor
                    value={userInput}
                    onChange={setUserInput}
                    disabled={evaluating}
                  />
                </>
              )}

              {goal && isTodaySelected && evaluation && (
                <div className="space-y-6 max-w-3xl">
                  <EvaluationPanel evaluation={evaluation.evaluation} goal={evaluation.goal} />
                  {currentUserText && (
                    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                      <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground mb-2">
                        Your writing
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {currentUserText}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {goal && isTodaySelected && !evaluation && isTodayCompleted && (
                <div className="space-y-4 max-w-3xl">
                  <GoalCard goal={goal} />
                  {currentUserText && (
                    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                      <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground mb-2">
                        Your writing
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {currentUserText}
                      </p>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
                      You already completed today&apos;s writing. A new goal will be available tomorrow.
                    </p>
                  </div>
                </div>
              )}

              {!isTodaySelected && selectedWriting && (
                <div className="space-y-4 max-w-3xl">
                  <GoalCard goal={selectedWriting.goal} />
                  {selectedWriting.user_input && (
                    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                      <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground mb-2">
                        Your writing
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedWriting.user_input}
                      </p>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
                      This is a past writing goal. You can review it here. New evaluations are only available for today&apos;s goal.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-cream-dark bg-white px-8 py-3 flex items-center justify-between shrink-0">
              <button
                type="button"
                className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60"
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </button>
              {isTodaySelected && !isTodayCompleted && !evaluation ? (
                <button
                  type="button"
                  className="font-[family-name:var(--font-dm-sans)] text-xs px-4 py-1.5 rounded-full border border-primary text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!userInput.trim() || evaluating}
                  onClick={handleSubmit}
                >
                  {evaluating ? "Evaluating..." : "Submit for evaluation"}
                </button>
              ) : evaluation && isTodaySelected ? (
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                    Your score:
                  </span>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-primary text-primary text-xs font-[family-name:var(--font-fraunces)]">
                    {evaluation.evaluation.score}
                    <span className="ml-1 text-[10px] text-gray-500">/ 100</span>
                  </span>
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </PremiumGuard>
  );
}
