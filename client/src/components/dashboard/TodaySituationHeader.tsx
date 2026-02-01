"use client";

import { SituationOutput } from "@/lib/api";
import { Sparkles } from "lucide-react";

type TodaySituationHeaderProps = {
  loadingSituation: boolean;
  dailySituation: SituationOutput | null;
};

export function TodaySituationHeader({ loadingSituation, dailySituation }: TodaySituationHeaderProps) {
  return (
    <div className="bg-white border-b border-cream-dark px-8 py-4 flex-shrink-0">
      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-500">Today&apos;s Situation</p>
      <h1 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
        {loadingSituation ? (
          <span className="flex items-center gap-2 text-gray-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="animate-pulse">Creating your situation...</span>
          </span>
        ) : (
          <span className="text-primary">{dailySituation?.situation || "No situation available"}</span>
        )}
      </h1>
    </div>
  );
}

