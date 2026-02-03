export interface RoleplayMessage {
  id: string;
  speaker: "ai" | "user";
  text: string;
  timestamp: Date;
  hasCorrection?: boolean;
}

export interface RoleplaySession {
  title: string;
  userRole: string;
  aiRole: string;
  learningGoal: string;
  suggestedVocab: Array<{
    term: string;
    meaning: string;
  }>;
}

export interface RoleplayEvaluation {
  grammarScore: number;
  clarityScore: number;
  naturalnessScore: number;
  keyMistake: {
    original: string;
    corrected: string;
    explanation: string;
  };
  improvedSentence: {
    original: string;
    improved: string;
    explanation: string;
  };
  vocabularyUpgrade: {
    original: string;
    upgraded: string;
    explanation: string;
  };
}

export interface RoleplayHistoryItem {
  id: number;
  title: string;
  completed: boolean;
  score: number | null;
  created_at: string | null;
}
