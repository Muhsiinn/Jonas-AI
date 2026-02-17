"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { UserProfile } from "@/types/user";

export default function SettingsPage() {
  const [userGoal, setUserGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [userLevelSpeaking, setUserLevelSpeaking] = useState("");
  const [userLevelReading, setUserLevelReading] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [success, setSuccess] = useState(false);
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!authLoading && isAuthenticated) {
        try {
          const profile = await apiClient.getUserProfile();
          setUserGoal(profile.user_goal);
          setUserLevelSpeaking(profile.user_level_speaking);
          setUserLevelReading(profile.user_level_reading);
          setUserRegion(profile.user_region);
          
          const goalOptions = [
            "travel", "business", "education", "immigration", "cultural", "family"
          ];
          if (!goalOptions.includes(profile.user_goal)) {
            setUserGoal("other");
            setCustomGoal(profile.user_goal);
          }
        } catch (err: any) {
          if (err.status === 404) {
            router.push('/onboarding');
          } else {
            setError(err.message || "Failed to load profile");
          }
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
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

  if (authLoading || loadingProfile) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
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
      await apiClient.updateUserProfile({
        user_goal: finalGoal,
        user_level_speaking: userLevelSpeaking,
        user_level_reading: userLevelReading,
        user_region: userRegion,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
              Update your learning preferences and goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl p-6 border border-cream-dark">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
                Profile updated successfully!
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
