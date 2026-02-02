import { User } from './user';
import { LessonStreamEvent, AgentOutput } from './lesson';

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
