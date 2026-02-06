import { Link } from "react-router-dom";
import lweLogo from "@/assets/lwe-logo.png";

export function LandingFooter() {
  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={lweLogo}
              alt="Lion's Wealth Engine"
              className="h-6 w-6 rounded object-cover"
            />
            <span className="font-semibold text-foreground text-sm">
              Lion's Wealth Engine
            </span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/70 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
          Lion's Wealth Engine is an AI-guided credit optimization platform. We
          generate documents and provide strategy—you execute the actions. We are
          not a credit repair organization. All actions require your e-sign
          consent and comply with FCRA/FDCPA regulations. Individual results vary
          based on credit profile and user effort.
        </p>
      </div>
    </footer>
  );
}
