"use client";

import { 
  MessageSquare, 
  PenTool, 
  BookOpen, 
  Brain, 
  Flame, 
  BarChart3 
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedIcon from "../ui/AnimatedIcon";

const features = [
  {
    icon: MessageSquare,
    title: "AI Roleplay",
    description: "Practice real conversations in German with our AI that adapts to your level and gives you real-world scenarios.",
    color: "bg-accent-purple/30",
    iconColor: "text-accent-purple",
  },
  {
    icon: PenTool,
    title: "Write in German",
    description: "Get smart vocabulary suggestions before you write, then receive 3-layer feedback on grammar, naturalness, and style.",
    color: "bg-secondary/30",
    iconColor: "text-primary",
  },
  {
    icon: BookOpen,
    title: "Daily Lessons",
    description: "Curated reading materials with translation, explanation, and evaluation to build your comprehension skills.",
    color: "bg-accent-mint/30",
    iconColor: "text-accent-mint",
  },
  {
    icon: Brain,
    title: "Smart Feedback",
    description: "Our AI remembers your mistakes and creates custom lessons to fix your weak points. It's like having a tutor who knows you.",
    color: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Stay motivated with daily goals, streak tracking, and a leaderboard to compete with other learners.",
    color: "bg-secondary/30",
    iconColor: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Weekly Reports",
    description: "Get detailed insights into your progress, common mistakes, and personalized recommendations every week.",
    color: "bg-accent-purple/30",
    iconColor: "text-accent-purple",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-8 md:px-12 lg:px-16 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block font-[family-name:var(--font-dm-sans)] text-primary font-semibold mb-4">
            FEATURES
          </span>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl font-bold text-foreground mb-5">
            Everything you need to
            <span className="text-primary"> master German</span>
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-base text-gray-600 max-w-2xl mx-auto">
            Jonas combines AI-powered conversations, personalized lessons, and smart feedback 
            to help you learn German faster than ever.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <AnimatedIcon delay={index * 0.1}>
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <IconComponent className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2} />
                  </div>
                </AnimatedIcon>
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
