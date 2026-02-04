"use client";

import { RoleplaySession } from "@/types/roleplay";
import Button from "@/components/ui/Button";

interface SessionContextCardProps {
  session: RoleplaySession;
  onFinishSession: () => void;
  disabled?: boolean;
}

export function SessionContextCard({ session, onFinishSession, disabled = false }: SessionContextCardProps) {
  return (
    <div className="w-96 bg-white border-r border-cream-dark flex flex-col overflow-hidden">
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 mb-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-4">
            {session.title}
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-1">
                Your Role
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground font-medium">
                {session.userRole}
              </p>
            </div>
            
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-1">
                AI Role
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground font-medium">
                {session.aiRole}
              </p>
            </div>
            
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-1">
                Learning Goal
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground">
                {session.learningGoal}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 border-t border-cream-dark pt-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-3 shrink-0">
            Suggested Vocabulary
          </p>
          <div className="space-y-2 overflow-y-auto flex-1">
            {session.suggestedVocab.map((vocab, index) => (
              <div
                key={index}
                className="bg-cream-dark/50 rounded-lg px-3 py-2 border border-cream-dark shrink-0"
              >
                <p className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-foreground">
                  {vocab.term}
                </p>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mt-0.5">
                  {vocab.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-cream-dark shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onFinishSession}
            className="w-full"
            disabled={disabled}
          >
            Finish Session
          </Button>
        </div>
      </div>
    </div>
  );
}
