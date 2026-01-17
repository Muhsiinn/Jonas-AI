"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "font-[family-name:var(--font-dm-sans)] font-semibold rounded-full transition-all duration-200 inline-flex items-center justify-center";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      secondary: "bg-secondary text-foreground hover:brightness-105 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      outline: "border-2 border-foreground text-foreground hover:bg-foreground hover:text-cream",
      ghost: "text-foreground hover:bg-cream-dark",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const disabledStyles = props.disabled ? "opacity-50 cursor-not-allowed hover:translate-y-0" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
