"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
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
    <div className="min-h-screen bg-cream">
      <nav className="bg-cream/80 backdrop-blur-md border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
            </div>
            <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
              Jonas
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-foreground mb-4">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-gray-600 mb-6">
            Ready to continue your German learning journey?
          </p>
          <div className="space-y-4">
            <div className="bg-cream rounded-2xl p-6">
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                Your Profile
              </h2>
              <div className="space-y-2 font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="bg-accent-mint/20 rounded-2xl p-6">
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                Coming Soon
              </h2>
              <p className="font-[family-name:var(--font-dm-sans)] text-gray-600">
                Daily situations, AI roleplay, and personalized lessons will be available here soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
