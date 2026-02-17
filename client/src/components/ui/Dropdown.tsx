"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
}

export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-cream-dark z-50">
          <div className="py-1">
            {items.map((item, index) => {
              const content = (
                <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-[family-name:var(--font-dm-sans)] text-foreground hover:bg-cream-dark transition-colors cursor-pointer">
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              );

              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={index}
                  onClick={() => handleItemClick(item)}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
