import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { AgentOutput, LessonHistoryItem, EvaluateLessonRequest, EvaluateLessonOutput, LessonProgress } from '@/types/lesson';
import { LessonStreamEvent } from '@/types/api';

export function useLesson() {
  const [lesson, setLesson] = useState<AgentOutput | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [lessonsHistory, setLessonsHistory] = useState<LessonHistoryItem[]>([]);
  const [evaluating, setEvaluating] = useState(false);

  const fetchLessonById = useCallback(async (lessonId: number) => {
    try {
      setLessonLoading(true);
      setLessonError(null);
      const data = await apiClient.getLessonById(lessonId);
      setLesson(data);
    } catch (err) {
      setLessonError(err instanceof Error ? err.message : "Failed to load lesson");
    } finally {
      setLessonLoading(false);
    }
  }, []);

  const fetchTodayLesson = useCallback(async (
    onProgress?: (event: LessonStreamEvent) => void
  ): Promise<AgentOutput> => {
    try {
      setLessonLoading(true);
      setLessonError(null);
      const data = await apiClient.createLesson(onProgress);
      setLesson(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load lesson";
      setLessonError(errorMessage);
      throw err;
    } finally {
      setLessonLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await apiClient.getLessonsHistory();
      setLessonsHistory(history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  const evaluateLesson = useCallback(async (data: EvaluateLessonRequest): Promise<EvaluateLessonOutput> => {
    try {
      setEvaluating(true);
      const result = await apiClient.evaluateLesson(data);
      setLesson(prev => prev ? { ...prev, completed: true, evaluation: result } : null);
      await fetchHistory();
      return result;
    } catch (err) {
      throw err;
    } finally {
      setEvaluating(false);
    }
  }, [fetchHistory]);

  const updateProgress = useCallback(async (progress: LessonProgress) => {
    try {
      await apiClient.updateProgress(progress);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, []);

  return {
    lesson,
    setLesson,
    lessonLoading,
    lessonError,
    lessonsHistory,
    evaluating,
    fetchLessonById,
    fetchTodayLesson,
    fetchHistory,
    evaluateLesson,
    updateProgress,
  };
}
