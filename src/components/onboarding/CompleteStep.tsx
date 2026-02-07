import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";

interface CompleteStepProps {
  onViewDashboard: () => void;
}

export function CompleteStep({ onViewDashboard }: CompleteStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
          <Trophy className="h-10 w-10 text-primary-foreground" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set! 🎉</h2>
        <p className="text-muted-foreground">Your credit optimization journey has officially begun.</p>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 text-left">
        <p className="text-sm font-medium text-foreground mb-2">What's next?</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Check your Next Best Move recommendations</li>
          <li>• Upload a full credit report for AI analysis</li>
          <li>• Explore your personalized wealth plan</li>
        </ul>
      </div>
      <Button variant="premium" size="lg" className="w-full" onClick={onViewDashboard}>
        View Dashboard
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
