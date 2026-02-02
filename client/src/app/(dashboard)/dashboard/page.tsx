"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { SituationOutput, ActivityHeatmapItem, LeaderboardData } from "@/types/api";
import { UserStats } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { TodaySituationHeader } from "@/components/features/dashboard/TodaySituationHeader";
import { DashboardActions } from "@/components/features/dashboard/DashboardActions";
import { useStats } from "@/lib/hooks/useStats";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [dailySituation, setDailySituation] = useState<SituationOutput | null>(null);
  const [loadingSituation, setLoadingSituation] = useState(true);
  
  const { userStats, practiceData, leaderboardData, loading: loadingStats, fetchStats } = useStats();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!loading && isAuthenticated) {
        try {
          const profileCheck = await apiClient.checkProfileExists();
          if (!profileCheck.exists) {
            router.push("/onboarding");
            return;
          }

          const situation = await apiClient.getDailySituation();
          setDailySituation(situation);
          fetchStats();
        } catch (error) {
          console.error("Error loading dashboard:", error);
        } finally {
          setCheckingProfile(false);
          setLoadingSituation(false);
        }
      }
    };

    checkAuthAndProfile();
  }, [loading, isAuthenticated, router, fetchStats]);

  if (loading || checkingProfile) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        <div className="text-center">
            <p className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
              Creating your personalized daily situation
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-500 mt-1">
              This may take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          practiceData={practiceData} 
          leaderboardData={leaderboardData}
          userStats={userStats}
          loading={loadingStats}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <TodaySituationHeader loadingSituation={loadingSituation} dailySituation={dailySituation} />
          <DashboardActions />
        </main>
      </div>
    </div>
  );
}
