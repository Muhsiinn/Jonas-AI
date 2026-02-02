"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, MessageSquare, PenTool } from "lucide-react";
import { apiClient } from "@/lib/api";
import { ActivityCompletion } from "@/types/api";

type ActivityIcon = typeof BookOpen;

type DashboardActionCardProps = {
  icon: ActivityIcon;
  titleLine1: string;
  titleLine2: string;
  completed: boolean;
  onClick?: () => void;
};

function DashboardActionCard({ icon, titleLine1, titleLine2, completed, onClick }: DashboardActionCardProps) {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border-2 border-cream-dark flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all min-h-[190px] text-left"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-cream-dark/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
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
              : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}
        >
          <span className="mr-1 text-xs">{completed ? "●" : "○"}</span>
          {completed ? "Done today" : "Not done"}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
          {completed ? "Great, keep the streak going." : "Perfect for today's situation."}
        </span>
      </div>

      <div className="mt-auto font-[family-name:var(--font-dm-sans)] text-xs px-3 py-2 rounded-full border border-cream-dark/80 text-foreground/90 bg-cream/70 flex items-center justify-center gap-1">
        <span>{completed ? "Revise session" : "Start session"}</span>
      </div>
    </button>
  );
}

export function DashboardActions() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiClient.getTodayActivities();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching today's activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-cream-dark min-h-[190px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
        <DashboardActionCard
          icon={BookOpen}
          titleLine1="Read"
          titleLine2="Lesson"
          completed={activities?.lesson_completed ?? false}
          onClick={() => router.push("/read")}
        />
        <DashboardActionCard
          icon={MessageSquare}
          titleLine1="AI"
          titleLine2="Roleplay"
          completed={activities?.roleplay_completed ?? false}
        />
        <DashboardActionCard
          icon={PenTool}
          titleLine1="Write in"
          titleLine2="German"
          completed={activities?.writing_completed ?? false}
        />
      </div>
    </div>
  );
}

