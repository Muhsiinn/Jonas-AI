export interface WritingGoalResponse {
  goal: string;
}

export interface WritingEvaluationRequest {
  user_input: string;
}

export interface WritingEvaluation {
  score: number;
  strengths: string;
  improvements: string;
  review: string;
}

export interface WritingEvaluationResponse {
  goal: string;
  evaluation: WritingEvaluation;
}

export interface WritingHistoryItem {
  id: number;
  goal: string;
  created_at: string;
  completed: boolean;
   user_input?: string | null;
}
