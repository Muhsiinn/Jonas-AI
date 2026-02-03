export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
    ME: '/api/v1/auth/me',
  },
  USERS: {
    PROFILE_EXISTS: '/api/v1/users/profile/exists',
    USER_PROFILE: '/api/v1/users/userprofile',
    DAILY_SITUATION: '/api/v1/users/dailysituation',
  },
  AGENTS: {
    CREATE_LESSON: '/api/v1/agents/create_lesson',
    EVALUATE_LESSON: '/api/v1/agents/evaluate_lesson',
    PROGRESS: '/api/v1/agents/progress',
    LESSONS: '/api/v1/agents/lessons',
    LESSON_BY_ID: (id: number) => `/api/v1/agents/lessons/${id}`,
    EXPLAIN: '/api/v1/agents/explain',
    TTS: '/api/v1/agents/tts',
  },
  STATS: {
    ME: '/api/v1/stats/me',
    ACTIVITY_HEATMAP: '/api/v1/stats/activity-heatmap',
    LEADERBOARD: '/api/v1/stats/leaderboard',
    TODAY_ACTIVITIES: '/api/v1/stats/today-activities',
  },
  ROLEPLAY: {
    GOAL: '/api/v1/roleplay/goal',
    SESSION: '/api/v1/roleplay/session',
    CHAT: '/api/v1/roleplay/chat',
    MESSAGES: '/api/v1/roleplay/messages',
    HISTORY: '/api/v1/roleplay/history',
    FINISH: '/api/v1/roleplay/finish',
  },
} as const;
