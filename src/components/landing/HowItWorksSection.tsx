import { motion } from "framer-motion";
import { Upload, Cpu, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Input Your Profile",
    description:
      "Enter your credit score or upload a full report. Our AI instantly maps your financial landscape.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Get Your Battle Plan",
    description:
      "AI generates your personalized roadmap — disputes, tradeline strategy, and funding timeline.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Execute & Grow",
    description:
      "Follow step-by-step moves. Watch your score climb and funding doors open — month by month.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 border-t border-border/50 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Three Steps to{" "}
            <span className="text-gradient-gold">Financial Freedom</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative group"
            >
              {/* Connector line (hidden on mobile & last item) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}

              <div className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 sm:p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                {/* Number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {step.number}
                </div>

                <div className="flex justify-center mb-5">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
