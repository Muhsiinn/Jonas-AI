"use client";

import { PenTool } from "lucide-react";

interface GoalCardProps {
  goal: string;
}

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cream-dark/20 flex items-center justify-center flex-shrink-0">
          <PenTool className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-2">
            Your writing goal
          </p>
          <p className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground leading-relaxed">
            {goal}
          </p>
        </div>
      </div>
    </div>
  );
}
