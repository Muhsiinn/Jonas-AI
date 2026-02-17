"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, MessageSquare, PenTool, GraduationCap, Lock } from "lucide-react";
import { apiClient } from "@/lib/api";
import { ActivityCompletion } from "@/types/api";
import { ROUTES } from "@/lib/config/routes";
import { LessonHistoryItem } from "@/types/lesson";
import { RoleplayHistoryItem } from "@/types/roleplay";
import { formatDate } from "@/lib/utils/format";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

type ActivityIcon = typeof BookOpen;

type DashboardActionCardProps = {
  icon: ActivityIcon;
  titleLine1: string;
  titleLine2: string;
  completed: boolean;
  inProgress?: boolean;
  onClick?: () => void;
  locked?: boolean;
  isPremium?: boolean;
};

function DashboardActionCard({
  icon,
  titleLine1,
  titleLine2,
  completed,
  inProgress = false,
  onClick,
  locked = false,
  isPremium = true,
}: DashboardActionCardProps) {
  const Icon = icon;
  const isTeacher = titleLine1 === "German" && titleLine2 === "Teacher";
  const statusLabel = isTeacher ? "Always available" : completed ? "Done today" : inProgress ? "In progress" : "Not done";
  const ctaLabel = isTeacher ? "Start session" : completed ? "Revise session" : inProgress ? "Resume session" : "Start session";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 border-cream-dark flex flex-col transition-all min-h-[190px] text-left ${
        locked ? "opacity-60 cursor-pointer" : "hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-cream-dark/20 flex items-center justify-center relative">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
          {locked && !isPremium && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
              <Lock className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground leading-tight">
            {titleLine1}
          </h2>
          {titleLine2 && (
            <h2 className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground leading-tight">
              {titleLine2}
            </h2>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-[family-name:var(--font-dm-sans)] ${
            completed
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : inProgress
              ? "bg-amber-50 text-amber-700 border border-amber-100"
              : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}
        >
          <span className="mr-1 text-xs">{completed ? "●" : "○"}</span>
          {statusLabel}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
          {isTeacher ? "Ask questions anytime." : completed ? "Great, keep the streak going." : "Perfect for today's situation."}
        </span>
      </div>

      <div className={`mt-auto font-[family-name:var(--font-dm-sans)] text-xs px-3 py-2 rounded-full border border-cream-dark/80 text-foreground/90 bg-cream/70 flex items-center justify-center gap-1 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <span>{ctaLabel}</span>
      </div>
    </button>
  );
}

export function DashboardActions() {
  const router = useRouter();
  const { isPremium, refetch } = useSubscription();
  const [activities, setActivities] = useState<ActivityCompletion | null>(null);
  const [lessonInProgress, setLessonInProgress] = useState(false);
  const [roleplayInProgress, setRoleplayInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handlePremiumFeatureClick = (route: string) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
    } else {
      router.push(route);
    }
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
    refetch();
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiClient.getTodayActivities();
        setActivities(data);

        // Only fetch premium features history if user is premium
        if (isPremium) {
          try {
            const [lessonsHistory, roleplayHistory] = await Promise.all([
              apiClient.getLessonsHistory(),
              apiClient.getRoleplayHistory(),
            ]);

            const todayLesson = lessonsHistory.find((l) => formatDate(l.created_at) === "Today");
            setLessonInProgress(Boolean(todayLesson && !todayLesson.completed));

            const todayRoleplay = roleplayHistory.find((r) => formatDate(r.created_at) === "Today");
            setRoleplayInProgress(Boolean(todayRoleplay && !todayRoleplay.completed));
          } catch (error) {
            // Silently fail for premium features if user loses premium during session
            console.error("Error fetching premium features history:", error);
          }
        } else {
          // Free users don't have lesson/roleplay history
          setLessonInProgress(false);
          setRoleplayInProgress(false);
        }
      } catch (error) {
        console.error("Error fetching today's activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isPremium]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-cream-dark min-h-[190px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          <DashboardActionCard
            icon={GraduationCap}
            titleLine1="German"
            titleLine2="Teacher"
            completed={false}
            inProgress={false}
            onClick={() => router.push(ROUTES.TEACHER)}
          />
          <DashboardActionCard
            icon={BookOpen}
            titleLine1="Read"
            titleLine2="Lesson"
            completed={activities?.lesson_completed ?? false}
            inProgress={lessonInProgress && !(activities?.lesson_completed ?? false)}
            onClick={() => handlePremiumFeatureClick(ROUTES.READ)}
            locked={!isPremium}
            isPremium={isPremium}
          />
          <DashboardActionCard
            icon={MessageSquare}
            titleLine1="AI"
            titleLine2="Roleplay"
            completed={activities?.roleplay_completed ?? false}
            inProgress={roleplayInProgress && !(activities?.roleplay_completed ?? false)}
            onClick={() => handlePremiumFeatureClick(ROUTES.ROLEPLAY)}
            locked={!isPremium}
            isPremium={isPremium}
          />
          <DashboardActionCard
            icon={PenTool}
            titleLine1="Write in"
            titleLine2="German"
            completed={activities?.writing_completed ?? false}
            onClick={() => handlePremiumFeatureClick(ROUTES.WRITING)}
            locked={!isPremium}
            isPremium={isPremium}
          />
        </div>
      </div>
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <UpgradePrompt onClose={handleCloseModal} />
        </div>
      )}
    </>
  );
}
