"use client";

import { SituationOutput } from "@/lib/api";

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
          <span className="text-gray-400">Loading...</span>
        ) : (
          <span className="text-primary">{dailySituation?.situation || "No situation available"}</span>
        )}
      </h1>
    </div>
  );
}

