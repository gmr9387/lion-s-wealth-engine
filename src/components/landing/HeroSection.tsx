import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { motion } from "framer-motion";

const stats = [
  { value: "700+", label: "Credit Score Target" },
  { value: "80%", label: "Faster Than DIY" },
  { value: "$5K+", label: "Saved vs. Agencies" },
  { value: "$500K+", label: "Funding Potential" },
];

export function HeroSection({ onShowDemo }: { onShowDemo: () => void }) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent rounded-full blur-[140px]"
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ boxShadow: ["0 0 40px hsl(40 76% 50% / 0.2)", "0 0 80px hsl(40 76% 50% / 0.4)", "0 0 40px hsl(40 76% 50% / 0.2)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden"
              >
                <img src={lweLogo} alt="Lion's Wealth Engine" className="h-full w-full object-cover" />
              </motion.div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              AI-Powered Credit & Wealth Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-[1.1] tracking-tight"
          >
            <span className="text-gradient-gold">Build Credit.</span>
            <br />
            <span className="text-gradient-gold">Stack Wealth.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Your AI engine tells you exactly what to do, when to do it, and generates every
            document you need on the path to{" "}
            <span className="text-foreground font-medium">700+ credit</span> and{" "}
            <span className="text-foreground font-medium">$500K+ funding</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14"
          >
            <Link to="/auth">
              <Button variant="premium" size="xl" className="text-base sm:text-lg px-8 w-full sm:w-auto">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="xl"
              className="text-base sm:text-lg w-full sm:w-auto"
              onClick={onShowDemo}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                className="text-center p-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <p className="text-2xl sm:text-3xl font-bold text-gradient-gold">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
