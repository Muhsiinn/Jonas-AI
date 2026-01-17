import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-secondary/30 rounded-full" />
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-accent-mint/30 rounded-full" />
        
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-primary font-[family-name:var(--font-fraunces)] font-bold text-xl">J</span>
          </div>
          <span className="font-[family-name:var(--font-fraunces)] font-bold text-2xl text-white">
            Jonas
          </span>
        </Link>

        <div className="relative z-10">
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Learn German
            <span className="block text-secondary">the smart way</span>
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-white/80 text-lg max-w-md">
            Practice real conversations with AI, get instant feedback, and master German 
            through real-life situations.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="font-[family-name:var(--font-dm-sans)] text-white/80 text-sm">
            Join 2,000+ learners
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
