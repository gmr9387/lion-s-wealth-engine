import { useEffect } from "react";
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

const features = [
  {
    icon: CreditCard,
    title: "AI Credit Analysis",
    description: "Deep analysis of your credit profile with actionable insights to boost your score fast.",
  },
  {
    icon: Target,
    title: "Automated Disputes",
    description: "Generate FCRA-compliant dispute letters with one click. Track progress in real-time.",
  },
  {
    icon: TrendingUp,
    title: "Wealth Building",
    description: "Personalized wealth plans with income strategies and asset building roadmaps.",
  },
  {
    icon: Crown,
    title: "Million Mode",
    description: "Elite funding sequences to unlock massive credit lines and business capital.",
  },
  {
    icon: Building2,
    title: "Business Credit",
    description: "LLC setup guidance, EIN applications, and vendor credit building strategies.",
  },
  {
    icon: Shield,
    title: "Compliance First",
    description: "All actions require e-sign consent and admin approval for your protection.",
  },
];

const stats = [
  { value: "$2.5M+", label: "Funding Unlocked" },
  { value: "150+", label: "Score Points Gained" },
  { value: "500+", label: "Disputes Won" },
  { value: "99%", label: "Satisfaction Rate" },
];

export default function Index() {
  const navigate = useNavigate();

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
            <span className="text-xl font-bold text-gradient-gold">CWE-X</span>
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
              <span className="text-sm font-medium text-primary">The Lion Credit & Wealth Engine</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="text-gradient-gold">Financial Future</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered credit optimization, automated disputes, wealth building strategies, 
              and elite funding sequences. From $2,000 to $1,000,000+.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/auth">
                <Button variant="premium" size="xl" className="text-lg px-8">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="text-lg">
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
              Everything You Need to
              <span className="text-gradient-gold"> Build Wealth</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and AI-powered insights to transform your credit, 
              unlock funding, and build lasting wealth.
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
              Ready to Transform Your Credit?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of users who have improved their credit scores 
              and unlocked new funding opportunities with CWE-X.
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
              <span className="font-semibold text-foreground">CWE-X</span>
              <span className="text-sm text-muted-foreground">© 2024</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              CWE-X provides educational information. We are not a credit repair organization.
              All actions require user consent and comply with FCRA regulations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
