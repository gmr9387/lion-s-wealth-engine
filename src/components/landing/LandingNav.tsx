import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { motion } from "framer-motion";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl"
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={lweLogo}
            alt="Lion's Wealth Engine"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-lg font-bold text-gradient-gold hidden sm:inline">
            Lion's Wealth Engine
          </span>
          <span className="text-lg font-bold text-gradient-gold sm:hidden">LWE</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="premium" size="sm">
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
