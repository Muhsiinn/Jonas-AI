"use client";

import { RoleplayEvaluation } from "@/types/roleplay";
import Button from "@/components/ui/Button";

interface EvaluationPanelProps {
  evaluation: RoleplayEvaluation;
  onPracticeAgain?: () => void;
  onNextScenario?: () => void;
}

export function EvaluationPanel({
  evaluation,
  onPracticeAgain,
  onNextScenario,
}: EvaluationPanelProps) {
  const handlePracticeAgain = () => {
    if (onPracticeAgain) {
      onPracticeAgain();
    } else {
      console.log("Practice again clicked");
    }
  };

  const handleNextScenario = () => {
    if (onNextScenario) {
      onNextScenario();
    } else {
      console.log("Next scenario clicked");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-cream p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-6">
            Session Evaluation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-2">
              Grammar Score
            </p>
            <p className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-primary">
              {evaluation.grammarScore}
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mt-1">/ 100</p>
          </div>

          <div className="bg-gradient-to-br from-accent-mint/20 to-accent-mint/30 rounded-xl border-2 border-accent-mint/30 p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-2">
              Clarity Score
            </p>
            <p className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-accent-mint">
              {evaluation.clarityScore}
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mt-1">/ 100</p>
          </div>

          <div className="bg-gradient-to-br from-accent-purple/20 to-accent-purple/30 rounded-xl border-2 border-accent-purple/30 p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-2">
              Naturalness Score
            </p>
            <p className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-accent-purple">
              {evaluation.naturalnessScore}
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mt-1">/ 100</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
              Key Mistake
            </p>
            <div className="space-y-2">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">Original:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground line-through">
                  {evaluation.keyMistake.original}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">Corrected:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground font-medium">
                  {evaluation.keyMistake.corrected}
                </p>
              </div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-700 mt-2">
                {evaluation.keyMistake.explanation}
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2">
              Improved Native Sentence
            </p>
            <div className="space-y-2">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">Your version:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground">
                  {evaluation.improvedSentence.original}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">Native version:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground font-medium">
                  {evaluation.improvedSentence.improved}
                </p>
              </div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-700 mt-2">
                {evaluation.improvedSentence.explanation}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
              Vocabulary Upgrade
            </p>
            <div className="space-y-2">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">You used:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground">
                  {evaluation.vocabularyUpgrade.original}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-1">Better alternative:</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground font-medium">
                  {evaluation.vocabularyUpgrade.upgraded}
                </p>
              </div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-700 mt-2">
                {evaluation.vocabularyUpgrade.explanation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-cream-dark">
          <Button variant="outline" size="sm" onClick={handlePracticeAgain}>
            Practice Again
          </Button>
          <Button variant="primary" size="sm" onClick={handleNextScenario}>
            Next Scenario
          </Button>
        </div>
      </div>
    </div>
  );
}
