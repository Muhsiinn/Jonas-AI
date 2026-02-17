"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/config/routes";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

type NavbarProps = {
  onLogout: () => void;
};

export function Navbar({ onLogout }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push(ROUTES.DASHBOARD);
    } else {
      router.push(ROUTES.HOME);
    }
  };

  const dropdownItems: DropdownItem[] = [
    {
      label: "Profile Settings",
      href: ROUTES.SETTINGS,
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Subscription",
      href: ROUTES.SUBSCRIPTION,
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Logout",
      onClick: onLogout,
      icon: <LogOut className="w-4 h-4" />,
    },
  ];

  const profileIcon = (
    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors">
      <User className="w-5 h-5 text-white" />
    </div>
  );

  return (
    <nav className="bg-white border-b border-cream-dark flex-shrink-0 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link 
          href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} 
          onClick={handleLogoClick}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
          </div>
          <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-foreground">
            onas
          </span>
        </Link>
        <Dropdown trigger={profileIcon} items={dropdownItems} />
      </div>
    </nav>
  );
}
