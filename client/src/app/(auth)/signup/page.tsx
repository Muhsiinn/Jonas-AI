"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { signup, resendVerification, isAuthenticated, loading: authLoading } = useAuth();
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
    setLoading(true);

    try {
      const result = await signup(email, password, name);
      setUserEmail(result.email);
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendVerification(userEmail);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
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
          {verificationSent ? "Check your email!" : "Create your account"}
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
          {verificationSent 
            ? "We've sent a verification link to your email address."
            : "Start your German learning journey today"
          }
        </p>
      </div>

      {verificationSent ? (
        <div className="space-y-4">
          <div className="bg-accent-mint/20 border border-accent-mint rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="font-[family-name:var(--font-fraunces)] font-bold text-foreground mb-2">
              Verification Email Sent
            </h3>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-4">
              We've sent a verification link to <strong>{userEmail}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button onClick={handleResend} variant="outline" size="md" className="w-full">
              Resend Verification Email
            </Button>
          </div>
          <p className="text-center font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
            Already verified?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
            {error}
          </div>
        )}

        <Input
          id="name"
          type="text"
          label="Full name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

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

        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 w-4 h-4 rounded border-cream-dark text-primary focus:ring-primary flex-shrink-0"
            required
            disabled={loading}
          />
          <label htmlFor="terms" className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600 leading-tight">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <Button type="submit" className="w-full" size="md" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      )}

      {!verificationSent && (
        <p className="mt-6 text-center font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
