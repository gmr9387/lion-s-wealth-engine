import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { ScoreStep } from "@/components/onboarding/ScoreStep";
import { DisputeStep } from "@/components/onboarding/DisputeStep";
import { CompleteStep } from "@/components/onboarding/CompleteStep";

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type OnboardingStep = "welcome" | "score" | "dispute" | "complete";

export function OnboardingWizard({ open, onOpenChange, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const navigate = useNavigate();

  const getProgress = () => {
    switch (step) {
      case "welcome": return 0;
      case "score": return 33;
      case "dispute": return 66;
      case "complete": return 100;
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
    setStep("welcome");
  };

  const handleViewDashboard = () => {
    handleComplete();
    navigate("/app");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Onboarding Wizard</DialogTitle>
          <DialogDescription>Complete your Lion's Wealth Engine setup</DialogDescription>
        </DialogHeader>
        
        {step !== "welcome" && step !== "complete" && (
          <div className="mb-4">
            <Progress value={getProgress()} className="h-1" />
          </div>
        )}
        
        {step === "welcome" && <WelcomeStep onNext={() => setStep("score")} />}
        {step === "score" && <ScoreStep onNext={() => setStep("dispute")} />}
        {step === "dispute" && (
          <DisputeStep onNext={() => setStep("complete")} onSkip={() => setStep("complete")} />
        )}
        {step === "complete" && <CompleteStep onViewDashboard={handleViewDashboard} />}
      </DialogContent>
    </Dialog>
  );
}
