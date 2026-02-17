"use client";

import { WritingEvaluation } from "@/types/writing";
import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";

interface EvaluationPanelProps {
  evaluation: WritingEvaluation;
  goal: string;
}

export function EvaluationPanel({ evaluation, goal }: EvaluationPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className={`rounded-2xl border-2 px-6 py-6 ${getScoreBg(evaluation.score)}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-1">
              Your score
            </p>
            <p
              className={`font-[family-name:var(--font-fraunces)] text-4xl font-bold ${getScoreColor(evaluation.score)}`}
            >
              {evaluation.score}
              <span className="text-lg text-gray-400 font-normal"> / 100</span>
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 leading-relaxed">
              {evaluation.review}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
            Strengths
          </p>
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 leading-relaxed">
          {evaluation.strengths}
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
            Areas for improvement
          </p>
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 leading-relaxed">
          {evaluation.improvements}
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-blue-500" />
          <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
            Writing goal
          </p>
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 italic">
          {goal}
        </p>
      </div>
    </div>
  );
}
