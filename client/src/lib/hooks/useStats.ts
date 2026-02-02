import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { UserStats, ActivityHeatmapItem, LeaderboardData } from '@/types/user';

export function useStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [practiceData, setPracticeData] = useState<ActivityHeatmapItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, heatmap, leaderboard] = await Promise.all([
        apiClient.getMyStats(),
        apiClient.getActivityHeatmap(),
        apiClient.getLeaderboard(),
      ]);
      setUserStats(stats);
      setPracticeData(heatmap);
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error("Error fetching stats:", error);
      const emptyHeatmap: ActivityHeatmapItem[] = [];
      const today = new Date();
      for (let i = 89; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        emptyHeatmap.push({ date: d.toISOString().split('T')[0], count: 0 });
      }
      setPracticeData(emptyHeatmap);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    userStats,
    practiceData,
    leaderboardData,
    loading,
    fetchStats,
  };
}
