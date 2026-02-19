import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { UserStats } from '@/types/user';
import { ActivityHeatmapItem, LeaderboardData } from '@/types/api';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function useStats() {
  const { isPremium } = useSubscription();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [practiceData, setPracticeData] = useState<ActivityHeatmapItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const createEmptyHeatmap = useCallback(() => {
    const emptyHeatmap: ActivityHeatmapItem[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      emptyHeatmap.push({ date: d.toISOString().split('T')[0], count: 0 });
    }
    return emptyHeatmap;
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Always fetch user stats (available for all users)
      const stats = await apiClient.getMyStats();
      setUserStats(stats);

      // Only fetch premium features if user is premium
      if (isPremium) {
        try {
          const [heatmap, leaderboard] = await Promise.all([
            apiClient.getActivityHeatmap(),
            apiClient.getLeaderboard(),
          ]);
          setPracticeData(heatmap);
          setLeaderboardData(leaderboard);
        } catch (error) {
          // If premium endpoints fail, set empty/default values
          console.error("Error fetching premium stats:", error);
          setPracticeData(createEmptyHeatmap());
          setLeaderboardData(null);
        }
      } else {
        // Free users get empty/default values
        setPracticeData(createEmptyHeatmap());
        setLeaderboardData(null);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setPracticeData(createEmptyHeatmap());
      setLeaderboardData(null);
    } finally {
      setLoading(false);
    }
  }, [isPremium, createEmptyHeatmap]);

  return {
    userStats,
    practiceData,
    leaderboardData,
    loading,
    fetchStats,
  };
}
