"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { apiClient } from "@/lib/api";
import { WritingEvaluationResponse } from "@/types/writing";
import { PremiumGuard } from "@/components/common/PremiumGuard";
import { GoalCard, WritingEditor, EvaluationPanel } from "./components";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setChecking(false);
      fetchGoal();
    }
  }, [authLoading, isAuthenticated]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createWritingGoal();
      setGoal(response.goal);
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

  const handleSubmit = async () => {
    if (!userInput.trim() || evaluating) return;

    try {
      setEvaluating(true);
      setError(null);
      const response = await apiClient.evaluateWriting({ user_input: userInput });
      setEvaluation(response);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to evaluate writing";
      setError(errorMessage);
    } finally {
      setEvaluating(false);
    }
  };

  const handleWriteAgain = () => {
    setEvaluation(null);
    setUserInput("");
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
            onClick={fetchGoal}
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

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-cream-dark px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-wide text-gray-500">
                  {evaluation ? "Writing evaluation" : "Write in German"}
                </p>
                <h1 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  {evaluation ? "Your results" : "Daily writing practice"}
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

            {goal && !evaluation && (
              <>
                <GoalCard goal={goal} />
                <WritingEditor
                  value={userInput}
                  onChange={setUserInput}
                  disabled={evaluating}
                />
              </>
            )}

            {goal && evaluation && (
              <EvaluationPanel evaluation={evaluation.evaluation} goal={evaluation.goal} />
            )}
          </div>

          <div className="border-t border-cream-dark bg-white px-8 py-3 flex items-center justify-between shrink-0">
            {evaluation ? (
              <>
                <button
                  type="button"
                  className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to dashboard
                </button>
                <button
                  type="button"
                  className="font-[family-name:var(--font-dm-sans)] text-xs px-4 py-1.5 rounded-full border border-primary text-white bg-primary"
                  onClick={handleWriteAgain}
                >
                  Write again
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to dashboard
                </button>
                <button
                  type="button"
                  className="font-[family-name:var(--font-dm-sans)] text-xs px-4 py-1.5 rounded-full border border-primary text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!userInput.trim() || evaluating}
                  onClick={handleSubmit}
                >
                  {evaluating ? "Evaluating..." : "Submit for evaluation"}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </PremiumGuard>
  );
}
