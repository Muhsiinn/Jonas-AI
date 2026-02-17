import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  SignupResponse,
  SituationOutput,
  LessonStreamEvent,
  AgentOutput,
} from '@/types/api';
import {
  User,
  UserProfileRequest,
  UserProfile,
  UserStats,
} from '@/types/user';
import {
  ActivityHeatmapItem,
  LeaderboardData,
  ActivityCompletion,
} from '@/types/api';
import {
  EvaluateLessonRequest,
  EvaluateLessonOutput,
  LessonProgress,
  LessonHistoryItem,
  VocabItem,
} from '@/types/lesson';
import {
  RoleplaySessionResponse,
  RoleplayMessageResponse,
  RoleplayChatRequest,
  RoleplayChatResponse,
  RoleplayHistoryResponse,
  RoleplayFinishResponse,
  TeacherChatRequest,
  TeacherChatResponse,
  TeacherMessageResponse,
  TeacherContextResponse,
  TeacherConversationResponse,
  TeacherHistoryResponse,
} from '@/types/api';
import {
  CheckoutSessionResponse,
  SubscriptionStatusResponse,
} from '@/types/subscription';
import { API_ENDPOINTS } from './endpoints';
import { getApiBaseUrl } from '@/lib/config/env';

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
      
      if (response.status === 401 || 
          response.status === 403 ||
          errorMessage.toLowerCase().includes('could not validate') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('validation error')) {
        this.handleAuthError();
      }
      
      throw customError;
    }

    return response.json();
  }

  private handleAuthError(): void {
    if (typeof window === 'undefined') return;
    
    this.removeToken();
    if (
      window.location.pathname !== '/' &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/signup'
    ) {
      window.location.href = '/login';
    }
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
    const response = await this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`, {
      method: 'GET',
    });
    this.setToken(response.access_token);
    return response;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.AUTH.ME);
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  async checkProfileExists(): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>(API_ENDPOINTS.USERS.PROFILE_EXISTS, {
      method: 'GET',
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>(API_ENDPOINTS.USERS.GET_PROFILE, {
      method: 'GET',
    });
  }

  async createUserProfile(data: UserProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>(API_ENDPOINTS.USERS.USER_PROFILE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfile(data: UserProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDailySituation(): Promise<SituationOutput> {
    return this.request<SituationOutput>(API_ENDPOINTS.USERS.DAILY_SITUATION, {
      method: 'GET',
    });
  }

  async createLesson(onProgress?: (event: LessonStreamEvent) => void): Promise<AgentOutput> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AGENTS.CREATE_LESSON}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      const errorMessage = error.detail || `HTTP error! status: ${response.status}`;
      
      if (response.status === 401 || 
          response.status === 403 ||
          errorMessage.toLowerCase().includes('could not validate') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('validation error')) {
        this.handleAuthError();
      }
      
      throw new Error(errorMessage);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result: AgentOutput | null = null;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        
        try {
          const eventData = JSON.parse(line.slice(6)) as LessonStreamEvent;
          
          if (eventData.type === 'error') {
            throw new Error(eventData.message || 'Failed to create lesson');
          }
          
          if (onProgress) {
            onProgress(eventData);
          }
          
          if (eventData.type === 'complete' && eventData.data) {
            result = eventData.data;
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }

    if (buffer.startsWith('data: ')) {
      try {
        const eventData = JSON.parse(buffer.slice(6)) as LessonStreamEvent;
        if (onProgress) {
          onProgress(eventData);
        }
        if (eventData.type === 'complete' && eventData.data) {
          result = eventData.data;
        }
      } catch (e) {
      }
    }

    if (!result) {
      throw new Error('Failed to create lesson - no data received');
    }

    return result;
  }

  async evaluateLesson(data: EvaluateLessonRequest): Promise<EvaluateLessonOutput> {
    return this.request<EvaluateLessonOutput>(API_ENDPOINTS.AGENTS.EVALUATE_LESSON, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProgress(progress: LessonProgress): Promise<{ status: string; progress: LessonProgress }> {
    return this.request<{ status: string; progress: LessonProgress }>(API_ENDPOINTS.AGENTS.PROGRESS, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  async getLessonsHistory(): Promise<LessonHistoryItem[]> {
    return this.request<LessonHistoryItem[]>(API_ENDPOINTS.AGENTS.LESSONS);
  }

  async getLessonById(lessonId: number): Promise<AgentOutput> {
    return this.request<AgentOutput>(API_ENDPOINTS.AGENTS.LESSON_BY_ID(lessonId));
  }

  async explainText(text: string): Promise<VocabItem> {
    return this.request<VocabItem>(`${API_ENDPOINTS.AGENTS.EXPLAIN}?text=${encodeURIComponent(text)}`);
  }

  async getMyStats(): Promise<UserStats> {
    return this.request<UserStats>(API_ENDPOINTS.STATS.ME);
  }

  async getActivityHeatmap(): Promise<ActivityHeatmapItem[]> {
    return this.request<ActivityHeatmapItem[]>(API_ENDPOINTS.STATS.ACTIVITY_HEATMAP);
  }

  async getLeaderboard(): Promise<LeaderboardData> {
    return this.request<LeaderboardData>(API_ENDPOINTS.STATS.LEADERBOARD);
  }

  async getTodayActivities(): Promise<ActivityCompletion> {
    return this.request<ActivityCompletion>(API_ENDPOINTS.STATS.TODAY_ACTIVITIES);
  }

  async createRoleplayGoal(): Promise<{ goal: string; user_role: string; ai_role: string }> {
    return this.request<{ goal: string; user_role: string; ai_role: string }>(API_ENDPOINTS.ROLEPLAY.GOAL);
  }

  async getRoleplaySession(): Promise<RoleplaySessionResponse> {
    return this.request<RoleplaySessionResponse>(API_ENDPOINTS.ROLEPLAY.SESSION);
  }

  async sendRoleplayMessage(request: RoleplayChatRequest): Promise<RoleplayChatResponse> {
    return this.request<RoleplayChatResponse>(API_ENDPOINTS.ROLEPLAY.CHAT, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getRoleplayMessages(): Promise<RoleplayMessageResponse[]> {
    return this.request<RoleplayMessageResponse[]>(API_ENDPOINTS.ROLEPLAY.MESSAGES);
  }

  async getRoleplayHistory(): Promise<RoleplayHistoryResponse[]> {
    return this.request<RoleplayHistoryResponse[]>(API_ENDPOINTS.ROLEPLAY.HISTORY);
  }

  async finishRoleplaySession(): Promise<RoleplayFinishResponse> {
    return this.request<RoleplayFinishResponse>(API_ENDPOINTS.ROLEPLAY.FINISH, {
      method: 'POST',
    });
  }

  async getTeacherConversation(): Promise<TeacherConversationResponse> {
    return this.request<TeacherConversationResponse>(API_ENDPOINTS.TEACHER.CONVERSATION);
  }

  async getTeacherMessages(): Promise<TeacherMessageResponse[]> {
    return this.request<TeacherMessageResponse[]>(API_ENDPOINTS.TEACHER.MESSAGES);
  }

  async sendTeacherMessage(request: TeacherChatRequest): Promise<TeacherChatResponse> {
    return this.request<TeacherChatResponse>(API_ENDPOINTS.TEACHER.CHAT, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTeacherContext(): Promise<TeacherContextResponse> {
    return this.request<TeacherContextResponse>(API_ENDPOINTS.TEACHER.CONTEXT);
  }

  async getTeacherHistory(): Promise<TeacherHistoryResponse[]> {
    return this.request<TeacherHistoryResponse[]>(API_ENDPOINTS.TEACHER.HISTORY);
  }

  async getTeacherMessagesByConversation(conversationId: number): Promise<TeacherMessageResponse[]> {
    return this.request<TeacherMessageResponse[]>(API_ENDPOINTS.TEACHER.MESSAGES_BY_ID(conversationId));
  }

  async createCheckoutSession(priceId: string): Promise<CheckoutSessionResponse> {
    return this.request<CheckoutSessionResponse>(API_ENDPOINTS.SUBSCRIPTION.CHECKOUT, {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId }),
    });
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    return this.request<SubscriptionStatusResponse>(API_ENDPOINTS.SUBSCRIPTION.STATUS);
  }

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(API_ENDPOINTS.SUBSCRIPTION.CANCEL, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(getApiBaseUrl());
