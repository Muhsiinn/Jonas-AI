const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
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

export interface SituationOutput {
  situation: string;
}

export interface VocabItem {
  term: string;
  meaning: string;
  example: string;
}

export interface LessonOutput {
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

export interface AgentOutput {
  lesson: LessonOutput;
  questions: Question[];
  vocabs: VocabItem[];
}

export interface EvaluateAnswer {
  question_id: number;
  answer: string;
}

export interface EvaluateLessonRequest {
  answers: EvaluateAnswer[];
}

export interface EvaluateLessonOutput {
  score: number;
  summary: string;
  focus_areas: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      const errorMessage = error.detail?.message || error.detail || `HTTP error! status: ${response.status}`;
      const customError: any = new Error(errorMessage);
      customError.status = response.status;
      customError.code = error.detail?.code;
      customError.email = error.detail?.email;
      throw customError;
    }

    return response.json();
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(`/api/v1/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
    this.setToken(response.access_token);
    return response;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me');
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  async checkProfileExists(): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>('/api/v1/users/profile/exists', {
      method: 'GET',
    });
  }

  async createUserProfile(data: UserProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v1/users/userprofile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDailySituation(): Promise<SituationOutput> {
    return this.request<SituationOutput>('/api/v1/users/dailysituation', {
      method: 'GET',
    });
  }

  async createLesson(): Promise<AgentOutput> {
    return this.request<AgentOutput>('/api/v1/agents/create_lesson', {
      method: 'GET',
    });
  }

  async evaluateLesson(data: EvaluateLessonRequest): Promise<EvaluateLessonOutput> {
    return this.request<EvaluateLessonOutput>('/api/v1/agents/evaluate_lesson', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
