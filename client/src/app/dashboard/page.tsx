"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { apiClient, SituationOutput } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TodaySituationHeader } from "@/components/dashboard/TodaySituationHeader";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [dailySituation, setDailySituation] = useState<SituationOutput | null>(null);
  const [loadingSituation, setLoadingSituation] = useState(true);

  const practiceData = useMemo(() => {
    const data: { date: Date; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 89);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const count = Math.floor(Math.random() * 4);
      data.push({ date, count });
    }

    return data;
  }, []);

  const leagueData = useMemo(() => {
    const currentUserSessions = 87;
    const isBronze = currentUserSessions >= 50;
    const promotionThreshold = 100;

    const allUsers = [
      { name: "Sarah M.", points: 245 },
      { name: "Tom K.", points: 218 },
      { name: "Lisa W.", points: 192 },
      { name: "Max R.", points: 145 },
      { name: "Anna L.", points: 132 },
      { name: "You", points: currentUserSessions, isCurrentUser: true },
      { name: "Jan P.", points: 68 },
      { name: "Emma S.", points: 52 },
      { name: "Lukas T.", points: 45 },
      { name: "Maria K.", points: 38 },
      { name: "Paul W.", points: 35 },
      { name: "Sophie H.", points: 32 },
    ].sort((a, b) => b.points - a.points);

    const bronzeUsers = allUsers.filter((u) => u.points >= 50);
    const relegationUsers = allUsers.filter((u) => u.points < 50);
    const currentUserRank = bronzeUsers.findIndex((u) => u.isCurrentUser) + 1;
    const topPercent =
      bronzeUsers.length > 0
        ? Math.round(((bronzeUsers.length - currentUserRank + 1) / bronzeUsers.length) * 100)
        : 0;

    const getNextUpdateDate = () => {
      const now = new Date();
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return {
      currentLeague: isBronze ? "Bronze" : "None",
      currentUserRank,
      currentUserPoints: currentUserSessions,
      topPercent,
      isInPromotionZone: currentUserSessions >= promotionThreshold,
      promotionThreshold,
      bronzeUsers,
      relegationUsers,
      nextUpdateDate: getNextUpdateDate(),
    };
  }, []);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!loading && !isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!loading && isAuthenticated) {
        try {
          const profileCheck = await apiClient.checkProfileExists();
          if (!profileCheck.exists) {
            router.push("/onboarding");
            return;
          }

          const situation = await apiClient.getDailySituation();
          setDailySituation(situation);
        } catch (error) {
          console.error("Error loading dashboard:", error);
        } finally {
          setCheckingProfile(false);
          setLoadingSituation(false);
        }
      }
    };

    checkAuthAndProfile();
  }, [loading, isAuthenticated, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <DashboardNavbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar practiceData={practiceData} leagueData={leagueData} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <TodaySituationHeader loadingSituation={loadingSituation} dailySituation={dailySituation} />
          <DashboardActions />
        </main>
      </div>
    </div>
  );
}
