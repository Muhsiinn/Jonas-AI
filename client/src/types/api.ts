import { User } from './user';
import { LessonStreamEvent, AgentOutput } from './lesson';
import { RoleplayEvaluation } from './roleplay';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupResponse {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface SituationOutput {
  situation: string;
}

export interface ActivityHeatmapItem {
  date: string;
  count: number;
}

export interface LeaderboardUser {
  rank: number;
  display_name: string;
  points: number;
  is_current_user: boolean;
}

export interface LeaderboardData {
  current_user_rank: number;
  current_user_points: number;
  top_percent: number;
  users: LeaderboardUser[];
}

export interface ActivityCompletion {
  lesson_completed: boolean;
  roleplay_completed: boolean;
  writing_completed: boolean;
}

export type { LessonStreamEvent, AgentOutput };

export interface RoleplaySessionResponse {
  title: string;
  userRole: string;
  aiRole: string;
  learningGoal: string;
  suggestedVocab: Array<{
    term: string;
    meaning: string;
  }>;
}

export interface RoleplayMessageResponse {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  hasCorrection?: boolean;
}

export interface RoleplayChatRequest {
  user_input: string;
}

export interface RoleplayChatResponse {
  reply: string;
  done?: boolean;
  evaluation?: RoleplayEvaluation;
}

export interface RoleplayHistoryResponse {
  id: number;
  title: string;
  completed: boolean;
  score: number | null;
  created_at: string | null;
}

export interface RoleplayFinishResponse {
  evaluation: RoleplayEvaluation;
  score: number;
}

export interface TeacherChatRequest {
  message: string;
}

export interface TeacherChatResponse {
  reply: string;
}

export interface TeacherMessageResponse {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

export interface TeacherContextResponse {
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

export interface TeacherConversationResponse {
  id: number;
  created_at: string;
}

export interface TeacherHistoryResponse {
  id: number;
  created_at: string;
  message_count: number;
}

