export interface TeacherMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TeacherContext {
  lesson_vocab?: Array<{
    term: string;
    meaning: string;
    example?: string;
  }> | null;
  lesson_grammar?: Array<{
    rule: string;
    explanation: string;
    example?: string;
  }> | null;
  roleplay_context?: {
    goal: string;
    user_role: string;
    ai_role: string;
    suggested_vocab?: Array<{
      term: string;
      meaning: string;
    }> | null;
  } | null;
  lesson_title?: string | null;
}

export interface TeacherConversation {
  id: number;
  created_at: string;
}

export interface TeacherHistoryItem {
  id: number;
  created_at: string;
  message_count: number;
}
