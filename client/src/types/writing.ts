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
