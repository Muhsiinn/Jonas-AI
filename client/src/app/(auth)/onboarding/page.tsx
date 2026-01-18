"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export default function OnboardingPage() {
  const [userGoal, setUserGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [userLevelSpeaking, setUserLevelSpeaking] = useState("");
  const [userLevelReading, setUserLevelReading] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!authLoading && isAuthenticated) {
        try {
          const profileCheck = await apiClient.checkProfileExists();
          if (profileCheck.exists) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkAuthAndProfile();
  }, [isAuthenticated, authLoading, router]);

  const goalOptions = [
    { value: "travel", label: "Travel & Tourism" },
    { value: "business", label: "Business & Work" },
    { value: "education", label: "Education & Studies" },
    { value: "immigration", label: "Immigration & Integration" },
    { value: "cultural", label: "Cultural Interest" },
    { value: "family", label: "Family & Relationships" },
    { value: "other", label: "Other" },
  ];

  const levelOptions = [
    { value: "beginner", label: "Beginner (A1)" },
    { value: "elementary", label: "Elementary (A2)" },
    { value: "intermediate", label: "Intermediate (B1)" },
    { value: "upper-intermediate", label: "Upper Intermediate (B2)" },
    { value: "advanced", label: "Advanced (C1)" },
    { value: "proficient", label: "Proficient (C2)" },
  ];

  const regionOptions = [
    { value: "germany", label: "Germany" },
    { value: "austria", label: "Austria" },
    { value: "switzerland", label: "Switzerland" },
    { value: "other-europe", label: "Other Europe" },
    { value: "north-america", label: "North America" },
    { value: "south-america", label: "South America" },
    { value: "asia", label: "Asia" },
    { value: "africa", label: "Africa" },
    { value: "oceania", label: "Oceania" },
    { value: "other", label: "Other" },
  ];

  if (authLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="font-[family-name:var(--font-dm-sans)] text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalGoal = userGoal === "other" ? customGoal : userGoal;

    if (!finalGoal || !userLevelSpeaking || !userLevelReading || !userRegion) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (userGoal === "other" && !customGoal.trim()) {
      setError("Please specify your goal");
      setLoading(false);
      return;
    }

    try {
      await apiClient.createUserProfile({
        user_goal: finalGoal,
        user_level_speaking: userLevelSpeaking,
        user_level_reading: userLevelReading,
        user_region: userRegion,
      });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="lg:hidden mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
          </div>
          <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
            Jonas
          </span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-1.5">
          Let's personalize your experience
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
          Help us understand your goals and level to create the best learning path for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
            {error}
          </div>
        )}

        <div>
          <Select
            id="user_goal"
            label="What's your main goal?"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            options={goalOptions}
            required
            disabled={loading}
          />
          {userGoal === "other" && (
            <div className="mt-3">
              <Input
                id="custom_goal"
                label="Please specify your goal"
                type="text"
                placeholder="Enter your goal"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Select
            id="user_level_speaking"
            label="Your speaking level"
            value={userLevelSpeaking}
            onChange={(e) => setUserLevelSpeaking(e.target.value)}
            options={levelOptions}
            required
            disabled={loading}
          />

          <Select
            id="user_level_reading"
            label="Your reading level"
            value={userLevelReading}
            onChange={(e) => setUserLevelReading(e.target.value)}
            options={levelOptions}
            required
            disabled={loading}
          />
        </div>

        <Select
          id="user_region"
          label="Which region are you interested in?"
          value={userRegion}
          onChange={(e) => setUserRegion(e.target.value)}
          options={regionOptions}
          required
          disabled={loading}
        />

        <Button type="submit" className="w-full" size="md" disabled={loading}>
          {loading ? "Setting up..." : "Continue to Dashboard"}
        </Button>
      </form>

      <p className="mt-6 text-center font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
        You can update these settings later in your profile
      </p>
    </div>
  );
}
