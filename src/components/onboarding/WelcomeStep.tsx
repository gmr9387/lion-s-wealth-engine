import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="h-10 w-10 text-primary-foreground" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to Lion's Wealth Engine!
        </h2>
        <p className="text-muted-foreground">
          Let's get your credit journey started in just 2 minutes.
        </p>
      </div>
      <div className="grid gap-3 text-left">
        {[
          { icon: TrendingUp, text: "Add your first credit score" },
          { icon: FileText, text: "Create your first dispute" },
          { icon: CheckCircle2, text: "Unlock personalized insights" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <item.icon className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">{item.text}</span>
          </div>
        ))}
      </div>
      <Button variant="premium" size="lg" className="w-full" onClick={onNext}>
        Let's Go
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
