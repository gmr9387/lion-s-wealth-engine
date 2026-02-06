 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  ArrowRight, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Shield, 
  CheckCircle2,
  Crown,
  Building2,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
 import { DemoVideoModal } from "@/components/DemoVideoModal";

const features = [
  {
    icon: CreditCard,
    title: "AI-Guided Credit Analysis",
    description: "Smart analysis identifies exactly which items to dispute first for maximum score impact.",
  },
  {
    icon: Target,
    title: "One-Click Dispute Generation",
    description: "FCRA-compliant letters generated instantly. You review, approve, and submit on your timeline.",
  },
  {
    icon: TrendingUp,
    title: "Personalized Wealth Roadmap",
    description: "Step-by-step guidance from credit repair to funding approval, tailored to your profile.",
  },
  {
    icon: Crown,
    title: "Funding Sequence Strategy",
    description: "Proven 12-24 month path from starter cards to $500K+ in business credit lines.",
  },
  {
    icon: Building2,
    title: "Business Credit Blueprint",
    description: "LLC setup guidance, EIN applications, and vendor credit building—all mapped out for you.",
  },
  {
    icon: Shield,
    title: "Legally Protected Process",
    description: "E-sign consent on every action. Full audit trail. FCRA/FDCPA compliant.",
  },
];

const stats = [
  { value: "12-18", label: "Months to 700+ Score" },
  { value: "80%", label: "Faster Than DIY" },
  { value: "$5K+", label: "Saved vs. Credit Repair" },
  { value: "500K+", label: "Max Funding Potential" },
];

export default function Index() {
  const navigate = useNavigate();
   const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/app");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-gold">Lion's Wealth Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="premium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Credit & Wealth Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient-gold">Lion's Wealth Engine</span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl">Your AI-Guided Path to 700+ Credit & $500K+ Funding</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The intelligent system that tells you exactly what to do, when to do it, and generates 
              every document you need. You execute—we accelerate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/auth">
                <Button variant="premium" size="xl" className="text-lg px-8">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
               <Button variant="outline" size="xl" className="text-lg" onClick={() => setShowDemo(true)}>
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-gradient-gold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Complete
              <span className="text-gradient-gold"> Credit & Wealth System</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI handles the strategy and paperwork. You make the decisions and take action. 
              Together, we compress a 5-year journey into 12-18 months.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold shadow-glow-lg">
                <DollarSign className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your 12-Month Transformation?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Get your personalized roadmap today. See exactly what steps to take, 
              when to take them, and what results to expect at each milestone.
            </p>
            <Link to="/auth">
              <Button variant="premium" size="xl" className="text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Lion's Wealth Engine</span>
              <span className="text-sm text-muted-foreground">© 2025</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-2xl">
              Lion's Wealth Engine is an AI-guided credit optimization platform. We generate documents and provide strategy—you execute the actions. 
              We are not a credit repair organization. All actions require your e-sign consent and comply with FCRA/FDCPA regulations. 
              Individual results vary based on credit profile and user effort.
            </p>
          </div>
        </div>
      </footer>

       <DemoVideoModal open={showDemo} onOpenChange={setShowDemo} />
    </div>
  );
}
