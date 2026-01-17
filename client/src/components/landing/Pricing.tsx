"use client";

import Link from "next/link";
import Button from "../ui/Button";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for trying out Jonas",
    features: [
      "1 daily situation",
      "Basic AI conversations",
      "Limited feedback",
      "Progress tracking",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "€12",
    period: "per month",
    description: "For serious learners",
    features: [
      "Unlimited situations",
      "Advanced AI roleplay",
      "3-layer smart feedback",
      "Custom lessons from mistakes",
      "Weekly progress reports",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    variant: "primary" as const,
    popular: true,
  },
  {
    name: "Team",
    price: "€8",
    period: "per user/month",
    description: "For companies & groups",
    features: [
      "Everything in Pro",
      "Team dashboard",
      "Custom situations",
      "Admin controls",
      "Bulk billing",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-8 md:px-12 lg:px-16 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block font-[family-name:var(--font-dm-sans)] text-primary font-semibold mb-4">
            PRICING
          </span>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl font-bold text-foreground mb-5">
            Simple, transparent
            <span className="text-primary"> pricing</span>
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-base text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-6 ${
                plan.popular ? "shadow-2xl ring-2 ring-primary scale-105" : "shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-[family-name:var(--font-dm-sans)] font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-[family-name:var(--font-fraunces)] text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-gray-500">
                    /{plan.period}
                  </span>
                </div>
                <p className="font-[family-name:var(--font-dm-sans)] text-gray-600 mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-accent-mint rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-[family-name:var(--font-dm-sans)] text-gray-700">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
