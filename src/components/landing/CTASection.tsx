import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-accent/5 p-8 sm:p-14 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(40 76% 50% / 0.15)",
                    "0 0 50px hsl(40 76% 50% / 0.3)",
                    "0 0 20px hsl(40 76% 50% / 0.15)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-16 w-16 rounded-2xl overflow-hidden"
              >
                <img
                  src={lweLogo}
                  alt="Lion's Wealth Engine"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to Start Your Transformation?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Get your personalized roadmap today. See the exact steps, timeline,
              and expected results at every milestone.
            </p>
            <Link to="/auth">
              <Button variant="premium" size="xl" className="text-base sm:text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
