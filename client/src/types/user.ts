export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  subscription_plan?: "free" | "premium";
  subscription_status?: "free" | "active" | "canceled" | "past_due" | "trialing";
}

export interface UserProfileRequest {
  user_goal: string;
  user_level_speaking: string;
  user_level_reading: string;
  user_region: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  user_goal: string;
  user_level_speaking: string;
  user_level_reading: string;
  user_region: string;
}

export interface UserStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  activities_count: number;
}
