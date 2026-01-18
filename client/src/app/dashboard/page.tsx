"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { apiClient, SituationOutput } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [dailySituation, setDailySituation] = useState<SituationOutput | null>(null);
  const [loadingSituation, setLoadingSituation] = useState(true);

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
            router.push('/onboarding');
            return;
          }
          
          const situation = await apiClient.getDailySituation();
          setDailySituation(situation);
        } catch (error) {
          console.error('Error loading dashboard:', error);
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
        <div className="text-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <nav className="bg-cream/80 backdrop-blur-md border-b border-cream-dark flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
            </div>
            <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
              onas
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-8">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl font-bold text-foreground">
              Today&apos;s Situation: {loadingSituation ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span className="text-primary">{dailySituation?.situation || "No situation available"}</span>
              )}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-cream-dark h-64 flex flex-col">
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-4">
                  Daily Streak
                </h2>
                <div className="flex-1 flex items-center justify-center">
                  <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 text-sm">
                    Coming soon
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-cream-dark h-64 flex flex-col">
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-4">
                  Leaderboard
                </h2>
                <div className="flex-1 flex items-center justify-center">
                  <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 text-sm">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-cream-dark flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                    Read
                  </h2>
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-4">
                    Lesson
                  </h2>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 text-sm text-center">
                      Coming soon
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-cream-dark flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-2">
                    Talk to German
                  </p>
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 mb-3">
                    (Real life situations)
                  </p>
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-4">
                    AI Roleplay
                  </h2>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 text-sm text-center">
                      Coming soon
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-cream-dark flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                    Write in
                  </h2>
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-4">
                    German
                  </h2>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-[family-name:var(--font-dm-sans)] text-gray-500 text-sm text-center">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
