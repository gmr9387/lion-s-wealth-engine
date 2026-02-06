import { motion } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  Target,
  Shield,
  Crown,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "AI Credit Analysis",
    description:
      "Identifies exactly which items to dispute first for maximum score impact.",
  },
  {
    icon: Target,
    title: "One-Click Disputes",
    description:
      "FCRA-compliant letters generated instantly. Review, approve, submit.",
  },
  {
    icon: TrendingUp,
    title: "Wealth Roadmap",
    description:
      "Step-by-step guidance from credit repair to funding, tailored to you.",
  },
  {
    icon: Crown,
    title: "Funding Sequences",
    description:
      "Proven 12-24 month path from starter cards to $500K+ business credit.",
  },
  {
    icon: Building2,
    title: "Business Credit",
    description:
      "LLC setup, EIN applications, and vendor credit building—all mapped out.",
  },
  {
    icon: Shield,
    title: "Legally Protected",
    description:
      "E-sign consent on every action. Full audit trail. FCRA/FDCPA compliant.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Your Complete{" "}
            <span className="text-gradient-gold">Credit & Wealth System</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            AI handles the strategy and paperwork. You make decisions and take
            action. Together, we compress a 5-year journey into 12-18 months.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
