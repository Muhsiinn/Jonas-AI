"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Invalid or expired verification token");
      }
    };

    verify();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
            </div>
            <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
              Jonas
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-2">
                Verifying your email...
              </h1>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
                Please wait while we verify your email address
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-2">
                Email Verified!
              </h1>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-6">
                {message}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-6xl mb-6">❌</div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground mb-2">
                Verification Failed
              </h1>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="primary" className="w-full" size="md">
                    Go to Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full" size="md">
                    Sign Up Again
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
