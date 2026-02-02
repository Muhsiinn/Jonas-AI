import Navbar from "@/components/features/landing/Navbar";
import Hero from "@/components/features/landing/Hero";
import Features from "@/components/features/landing/Features";
import HowItWorks from "@/components/features/landing/HowItWorks";
import Pricing from "@/components/features/landing/Pricing";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
      </main>
  );
}
