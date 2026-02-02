export interface VocabItem {
  term: string;
  meaning: string;
  example: string;
}

export interface LessonOutput {
  id?: number;
  user_id: number | null;
  title: string;
  paragraphs: string[];
}

export interface Question {
  id: number;
  type: "mcq" | "short";
  options: string[] | null;
  question: string;
}

export interface GrammarExample {
  sentence: string;
  explanation: string;
}

export interface GrammarItem {
  rule: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface LessonProgress {
  current_step: string;
  vocab_read: boolean[];
  article_read_once: boolean;
  answers: Record<number, string>;
  active_vocab_index: number;
  active_question_index: number;
}

export interface AgentOutput {
  lesson: LessonOutput;
  questions: Question[];
  vocabs: VocabItem[];
  grammar?: GrammarItem[];
  progress?: LessonProgress;
  completed?: boolean;
  is_today?: boolean;
  created_at?: string;
  evaluation?: EvaluateLessonOutput | null;
}

export interface EvaluateAnswer {
  question_id: number;
  answer: string;
}

export interface EvaluateLessonRequest {
  answers: EvaluateAnswer[];
}

export interface QuestionFeedback {
  question_id: number;
  correct: boolean;
  correct_option_index?: number;
  ideal_answer?: string;
  explanation?: string;
}

export interface EvaluateLessonOutput {
  score: number;
  summary: string;
  focus_areas: string[];
  per_question: QuestionFeedback[];
}

export interface LessonHistoryItem {
  id: number;
  title: string;
  score: number | null;
  completed: boolean;
  created_at: string | null;
}

export interface LessonStreamEvent {
  type: 'progress' | 'complete' | 'error';
  step?: string;
  message?: string;
  data?: AgentOutput;
}
