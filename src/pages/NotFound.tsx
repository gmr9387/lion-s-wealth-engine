import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import lweLogo from "@/assets/lwe-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="flex justify-center mb-6">
          <img src={lweLogo} alt="Lion's Wealth Engine" className="h-16 w-16 rounded-2xl object-cover opacity-50" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Search className="w-8 h-8 text-muted-foreground/50" />
          <h1 className="text-6xl font-bold text-gradient-gold">404</h1>
        </div>
        <p className="text-lg text-foreground font-medium mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="premium" size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;