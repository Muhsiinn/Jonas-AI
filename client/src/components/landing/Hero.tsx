"use client";

import Link from "next/link";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="min-h-screen pt-20 pb-12 px-8 md:px-12 lg:px-16 relative overflow-hidden">
      <span className="absolute top-40 left-30 font-[family-name:var(--font-fraunces)] text-6xl font-bold text-primary/10 rotate-12 animate-float">ß</span>
      <span className="absolute top-40 right-20 font-[family-name:var(--font-fraunces)] text-5xl font-bold text-accent-purple/20 rotate-45 animate-float stagger-2">ö</span>
      <span className="absolute bottom-40 left-1/4 font-[family-name:var(--font-fraunces)] text-5xl font-bold text-primary/10 animate-float stagger-3">ü</span>
      <span className="absolute top-1/2 right-1/4 font-[family-name:var(--font-fraunces)] text-4xl font-bold text-accent-mint/10 animate-float stagger-4">ß</span>
      <span className="absolute bottom-20 right-10 font-[family-name:var(--font-fraunces)] text-5xl font-bold text-primary/10 animate-float stagger-5">ä</span>
      <span className="absolute top-1/3 left-1/3 font-[family-name:var(--font-fraunces)] text-4xl font-bold text-accent-purple/20 animate-float stagger-1">ü</span>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[80vh]">
          <div className="space-y-6 opacity-0 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm mt-6">
              <span className="text-sm">🇩🇪</span>
              <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-foreground">
                Learn German the Smart Way
              </span>
            </div>
            
            <h1 className="font-[family-name:var(--font-fraunces)] text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Master German
              <span className="block text-primary">through real</span>
              <span className="block">conversations</span>
            </h1>
            
            <p className="font-[family-name:var(--font-dm-sans)] text-base md:text-lg text-gray-600 max-w-lg">
              Practice German in real-life situations with AI roleplay, get instant feedback, 
              and track your progress. Perfect for work, travel, or daily life.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-cream flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-secondary fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
                  Loved by 2,000+ learners
                </p>
              </div>
            </div>
          </div>

          <div className="relative opacity-0 animate-fade-in-up stagger-2">
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-500">Today&apos;s Situation</p>
                  <p className="font-[family-name:var(--font-fraunces)] font-semibold text-foreground">Job Interview</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-cream rounded-2xl p-4">
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-2">AI says:</p>
                  <p className="font-[family-name:var(--font-dm-sans)] text-foreground">
                    &quot;Guten Tag! Erzählen Sie mir bitte etwas über sich.&quot;
                  </p>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-4 ml-8">
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-2">You write:</p>
                  <p className="font-[family-name:var(--font-dm-sans)] text-foreground">
                    &quot;Ich bin Software-Entwickler mit 5 Jahren Erfahrung...&quot;
                  </p>
                </div>

                <div className="bg-accent-mint/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✨</span>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-foreground">AI Feedback</p>
                  </div>
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700">
                    Great! Consider using &quot;verfüge über&quot; instead of &quot;habe&quot; for a more professional tone.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-secondary rounded-2xl p-3 shadow-lg animate-wiggle">
              <span className="text-2xl">🔥</span>
              <span className="font-[family-name:var(--font-dm-sans)] font-bold text-foreground ml-1">7 day streak!</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream-dark to-transparent" />
    </section>
  );
}
