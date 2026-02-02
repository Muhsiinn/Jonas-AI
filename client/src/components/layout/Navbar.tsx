"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

type NavbarProps = {
  onLogout: () => void;
};

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-cream-dark flex-shrink-0 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
          </div>
          <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
            onas
          </span>
        </Link>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </nav>
  );
}
