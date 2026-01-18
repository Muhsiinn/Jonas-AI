"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, resendVerification, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!authLoading && isAuthenticated) {
        try {
          const profileCheck = await apiClient.checkProfileExists();
          if (profileCheck.exists) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="font-[family-name:var(--font-dm-sans)] text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setShowResend(true);
        setEmail(err.email || email);
      }
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerification(email);
      setResendSuccess(true);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
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
          Welcome back
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
          Log in to continue your German journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
            {error}
          </div>
        )}

        {showResend && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
            <p className="mb-2">Didn&apos;t receive the verification email?</p>
            {resendSuccess ? (
              <p className="text-green-700 font-semibold">✓ Verification email sent! Please check your inbox.</p>
            ) : (
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full"
                size="sm"
                variant="secondary"
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </Button>
            )}
          </div>
        )}

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="font-[family-name:var(--font-dm-sans)] text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" size="md" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
