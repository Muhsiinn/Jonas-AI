"use client";

import { UserStats } from "@/types/user";
import { ActivityHeatmapItem, LeaderboardData } from "@/types/api";
import { Flame, Trophy } from "lucide-react";
import { formatDate, getNextUpdateDate } from "@/lib/utils/format";

type SidebarProps = {
  practiceData: ActivityHeatmapItem[];
  leaderboardData: LeaderboardData | null;
  userStats: UserStats | null;
  loading: boolean;
};

export function Sidebar({ practiceData, leaderboardData, userStats, loading }: SidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="bg-secondary/30 rounded-2xl p-6 shadow-sm border-2 border-secondary/40">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
              Daily Streak
            </h2>
          </div>
          
          {userStats && (
            <div className="flex items-center justify-between gap-3 mb-3 pt-2 text-xs">
              <div className="text-center">
                <p className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-gray-700">
                Longest : {userStats.longest_streak}
                </p>
              </div>
              <div className="w-px h-6 bg-cream-dark" />
            
              <div className="text-center">
                <p className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-primary">
                Current : {userStats.current_streak}
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
              {practiceData.map((item, index) => {
                const bgColor =
                  item.count === 0
                    ? "bg-cream-dark"
                    : item.count === 1
                    ? "bg-primary/30"
                    : item.count === 2
                    ? "bg-primary/60"
                    : "bg-primary";

                return (
                  <div
                    key={index}
                    className={`w-2.5 h-2.5 rounded ${bgColor} hover:ring-2 hover:ring-primary/50 cursor-pointer`}
                    title={`${formatDate(item.date)}: ${item.count} practice session${
                      item.count !== 1 ? "s" : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-cream-dark">
            <span className="font-[family-name:var(--font-dm-sans)] text-gray-600">
              {userStats?.activities_count || 0} total sessions
            </span>
            <div className="flex items-center gap-1">
              <span className="font-[family-name:var(--font-dm-sans)] text-gray-500">Less</span>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded bg-cream-dark" />
                <div className="w-2.5 h-2.5 rounded bg-primary/30" />
                <div className="w-2.5 h-2.5 rounded bg-primary/60" />
                <div className="w-2.5 h-2.5 rounded bg-primary" />
              </div>
              <span className="font-[family-name:var(--font-dm-sans)] text-gray-500">More</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/20 rounded-2xl p-6 shadow-sm border-2 border-primary/30 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
              Leaderboard
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboardData ? (
            <>
              <div className="mb-3 pb-3 border-b border-cream-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                      Top {leaderboardData.top_percent}%
                    </p>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                      Rank: #{leaderboardData.current_user_rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">Your points</p>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-primary">
                      {leaderboardData.current_user_points}
                    </p>
                  </div>
                </div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mt-2">
                  Next update: {getNextUpdateDate()}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                {leaderboardData.users.map((user: { rank: number; display_name: string; points: number; is_current_user: boolean }) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-2 ${
                      user.is_current_user ? "bg-primary/20 rounded px-2 py-1" : ""
                    }`}
                  >
                    <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 w-6">
                      {user.rank}.
                    </span>
                    <p
                      className={`font-[family-name:var(--font-dm-sans)] text-sm flex-1 truncate ${
                        user.is_current_user ? "text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      {user.is_current_user ? "You" : user.display_name}
                    </p>
                    <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                      {user.points}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-500 text-center py-4">
              Complete lessons to join the leaderboard!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
