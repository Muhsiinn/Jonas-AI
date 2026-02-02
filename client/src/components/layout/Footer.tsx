"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-cream py-16 px-8 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
              </div>
              <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-cream">
                Jonas
              </span>
            </Link>
            <p className="font-[family-name:var(--font-dm-sans)] text-cream/70 max-w-sm">
              Learn German through real-life situations with AI-powered conversations 
              and personalized feedback.
            </p>
          </div>

          <div>
            <h4 className="font-[family-name:var(--font-fraunces)] font-bold text-cream mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">Pricing</Link></li>
              <li><Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-[family-name:var(--font-fraunces)] font-bold text-cream mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">About</Link></li>
              <li><Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">Blog</Link></li>
              <li><Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/70 hover:text-cream transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-cream/50 text-sm">
            © 2026 Jonas. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/50 hover:text-cream text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-[family-name:var(--font-dm-sans)] text-cream/50 hover:text-cream text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
