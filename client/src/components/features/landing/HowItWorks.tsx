"use client";

import { Target, Briefcase, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedIcon from "@/components/ui/AnimatedIcon";

const steps = [
  {
    step: "01",
    title: "Tell us your goal",
    description: "Learning for work? Travel? Daily life? We'll customize your experience based on why you're learning German.",
    icon: Target,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    step: "02",
    title: "Get your daily situation",
    description: "Each day, you'll get a real-life scenario like a job interview, ordering food, or chatting with colleagues.",
    icon: Briefcase,
    iconColor: "text-primary",
    bgColor: "bg-secondary/20",
  },
  {
    step: "03",
    title: "Practice with AI",
    description: "Have natural conversations with our AI. It adapts to your level and gently corrects your mistakes.",
    icon: Bot,
    iconColor: "text-accent-purple",
    bgColor: "bg-accent-purple/20",
  },
  {
    step: "04",
    title: "Get smart feedback",
    description: "Receive 3-layer feedback: grammar corrections, natural phrasing, and native expressions.",
    icon: Sparkles,
    iconColor: "text-primary",
    bgColor: "bg-accent-mint/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-8 md:px-12 lg:px-16 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block font-[family-name:var(--font-dm-sans)] text-primary font-semibold mb-4">
            HOW IT WORKS
          </span>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl font-bold text-foreground mb-5">
            Learn German in
            <span className="text-primary"> 4 simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <AnimatedIcon delay={index * 0.15}>
                    <div className="w-28 h-28 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-5 mx-auto">
                      <div className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center`}>
                        <IconComponent className={`w-9 h-9 ${step.iconColor}`} strokeWidth={2} />
                      </div>
                    </div>
                  </AnimatedIcon>
                  <div className="text-center">
                    <span className="font-[family-name:var(--font-fraunces)] text-primary font-bold text-xs">
                      STEP {step.step}
                    </span>
                    <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground mt-2 mb-2">
                      {step.title}
                    </h3>
                    <p className="font-[family-name:var(--font-dm-sans)] text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
