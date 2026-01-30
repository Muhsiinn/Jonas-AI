"use client";

type PracticeDataPoint = {
  date: Date;
  count: number;
};

type LeagueUser = {
  name: string;
  points: number;
  isCurrentUser?: boolean;
};

type LeagueData = {
  topPercent: number;
  currentUserRank: number;
  currentUserPoints: number;
  isInPromotionZone: boolean;
  nextUpdateDate: string;
  bronzeUsers: LeagueUser[];
  relegationUsers: LeagueUser[];
};

type DashboardSidebarProps = {
  practiceData: PracticeDataPoint[];
  leagueData: LeagueData;
};

export function DashboardSidebar({ practiceData, leagueData }: DashboardSidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="bg-secondary/30 rounded-2xl p-6 shadow-sm border-2 border-secondary/40">
          <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground mb-3">
            Daily Streak
          </h2>
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
                    title={`${item.date.toLocaleDateString()}: ${item.count} practice session${
                      item.count !== 1 ? "s" : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-cream-dark">
            <span className="font-[family-name:var(--font-dm-sans)] text-gray-600">
              {practiceData.reduce((sum, item) => sum + item.count, 0)} practice sessions
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
          <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground mb-3">
            Leaderboard
          </h2>

          <div className="mb-3 pb-3 border-b border-cream-dark">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🥉</span>
              <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-foreground">
                Bronze League
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                  Top {leagueData.topPercent}%
                </p>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                  Rank: {leagueData.currentUserRank}
                </p>
              </div>
              <div className="text-right">
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">Your points</p>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-primary">
                  {leagueData.currentUserPoints}
                </p>
              </div>
            </div>
            {leagueData.isInPromotionZone && (
              <div className="mt-2 bg-secondary/30 rounded-lg px-2 py-1">
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-foreground font-semibold">
                  🚀 Promotion Zone!
                </p>
              </div>
            )}
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mt-2">
              Next update: {leagueData.nextUpdateDate}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {leagueData.bronzeUsers.map((user, idx) => (
              <div
                key={user.name}
                className={`flex items-center gap-2 ${
                  user.isCurrentUser ? "bg-primary/20 rounded px-2 py-1" : ""
                }`}
              >
                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 w-4">
                  {idx + 1}.
                </span>
                <p
                  className={`font-[family-name:var(--font-dm-sans)] text-sm flex-1 truncate ${
                    user.isCurrentUser ? "text-primary font-semibold" : "text-foreground"
                  }`}
                >
                  {user.name}
                </p>
                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                  {user.points}
                </span>
              </div>
            ))}
            {leagueData.relegationUsers.length > 0 && (
              <>
                <div className="pt-2 mt-2 border-t border-cream-dark">
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-red-600 mb-2">
                    Relegation Zone
                  </p>
                </div>
                {leagueData.relegationUsers.map((user, idx) => (
                  <div key={user.name} className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 w-4">
                      {leagueData.bronzeUsers.length + idx + 1}.
                    </span>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 flex-1 truncate">
                      {user.name}
                    </p>
                    <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500">
                      {user.points}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

