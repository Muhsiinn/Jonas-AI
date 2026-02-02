"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-cream-dark">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
          </div>
          <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
            onas
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="font-[family-name:var(--font-dm-sans)] text-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="font-[family-name:var(--font-dm-sans)] text-foreground hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="#pricing" className="font-[family-name:var(--font-dm-sans)] text-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Start Free</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
