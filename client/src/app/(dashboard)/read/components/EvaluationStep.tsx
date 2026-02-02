"use client";

import { EvaluateLessonOutput, Question } from "@/types/lesson";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface EvaluationStepProps {
  evaluation: EvaluateLessonOutput;
  questions: Question[];
  answers: Record<number, string>;
}

export function EvaluationStep({
  evaluation,
  questions,
  answers,
}: EvaluationStepProps) {
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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl space-y-6">
        <div className={`rounded-2xl border-2 px-6 py-6 ${getScoreBg(evaluation.score)}`}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-1">Your score</p>
              <p className={`font-[family-name:var(--font-fraunces)] text-4xl font-bold ${getScoreColor(evaluation.score)}`}>
                {evaluation.score}
                <span className="text-lg text-gray-400 font-normal"> / 100</span>
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 leading-relaxed">
                {evaluation.summary}
              </p>
            </div>
          </div>
        </div>

        {evaluation.focus_areas.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
                Areas to focus on
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {evaluation.focus_areas.map((area, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-[family-name:var(--font-dm-sans)] bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
            Question-by-question review
          </p>
          
          {questions.map((q) => {
            const feedback = evaluation.per_question?.find(pq => pq.question_id === q.id);
            const userAnswer = answers[q.id];
            const isCorrect = feedback?.correct ?? false;

            return (
              <div 
                key={q.id} 
                className={`bg-white rounded-2xl border-2 px-6 py-5 ${
                  isCorrect ? "border-emerald-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1 rounded-full ${isCorrect ? "bg-emerald-100" : "bg-red-100"}`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground">
                      {q.question}
                    </p>
                    
                    <div className="space-y-2">
                      <div className={`rounded-lg px-3 py-2 ${isCorrect ? "bg-emerald-50" : "bg-red-50"}`}>
                        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-0.5">
                          Your answer
                        </p>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground">
                          {q.type === "mcq" && q.options 
                            ? q.options[Number(userAnswer)] || "No answer" 
                            : userAnswer || "No answer"}
                        </p>
                      </div>

                      {q.type === "mcq" && !isCorrect && feedback?.correct_option_index !== undefined && q.options && (
                        <div className="rounded-lg px-3 py-2 bg-emerald-50">
                          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-0.5">
                            Correct answer
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-emerald-700">
                            {q.options[feedback.correct_option_index]}
                          </p>
                        </div>
                      )}

                      {q.type === "short" && feedback?.ideal_answer && (
                        <div className="rounded-lg px-3 py-2 bg-blue-50">
                          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-0.5">
                            Expected answer
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-blue-700">
                            {feedback.ideal_answer}
                          </p>
                        </div>
                      )}

                      {feedback?.explanation && (
                        <div className="rounded-lg px-3 py-2 bg-gray-50 border border-gray-200">
                          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-0.5">
                            Feedback
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700">
                            {feedback.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
