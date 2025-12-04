import { useState } from "react";
import { format, addDays, addHours } from "date-fns";
import { Calendar, Clock, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SequenceStep {
  id: string;
  order: number;
  action: string;
  provider: string;
  expectedAmount: number;
  timing: string;
  requirements: string[];
  riskLevel: "low" | "medium" | "high";
  scheduledTime?: Date;
  status: "pending" | "scheduled" | "in_progress" | "completed" | "failed";
}

interface SequenceSchedulerProps {
  steps: SequenceStep[];
  maxHardPulls48h?: number;
  onSchedule: (steps: SequenceStep[]) => void;
  onExecute: (stepId: string) => void;
  className?: string;
}

export function SequenceScheduler({
  steps: initialSteps,
  maxHardPulls48h = 6,
  onSchedule,
  onExecute,
  className,
}: SequenceSchedulerProps) {
  const [steps, setSteps] = useState(initialSteps);
  const [startDate, setStartDate] = useState(new Date());

  const calculateSchedule = () => {
    const scheduled: SequenceStep[] = [];
    let currentTime = startDate;
    let pullsIn48h = 0;

    for (const step of steps) {
      // Check if we've hit the max pulls limit
      if (pullsIn48h >= maxHardPulls48h) {
        // Wait 48 hours before continuing
        currentTime = addHours(currentTime, 48);
        pullsIn48h = 0;
      }

      // Schedule the step
      scheduled.push({
        ...step,
        scheduledTime: currentTime,
        status: "scheduled",
      });

      // Add delay between applications
      currentTime = addHours(currentTime, 4); // 4 hour gap between apps
      pullsIn48h++;
    }

    setSteps(scheduled);
    onSchedule(scheduled);
  };

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low": return "text-success bg-success/10 border-success/20";
      case "medium": return "text-warning bg-warning/10 border-warning/20";
      case "high": return "text-destructive bg-destructive/10 border-destructive/20";
    }
  };

  const getStatusConfig = (status: SequenceStep["status"]) => {
    switch (status) {
      case "pending":
        return { icon: Clock, color: "text-muted-foreground", label: "Pending" };
      case "scheduled":
        return { icon: Calendar, color: "text-primary", label: "Scheduled" };
      case "in_progress":
        return { icon: Clock, color: "text-warning", label: "In Progress" };
      case "completed":
        return { icon: CheckCircle, color: "text-success", label: "Completed" };
      case "failed":
        return { icon: AlertTriangle, color: "text-destructive", label: "Failed" };
    }
  };

  const totalExpectedFunding = steps.reduce((sum, s) => sum + s.expectedAmount, 0);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Funding Sequence Schedule</CardTitle>
          <div className="text-sm text-muted-foreground">
            Max {maxHardPulls48h} pulls per 48h
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Total Steps</p>
            <p className="text-2xl font-bold text-foreground">{steps.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected Funding</p>
            <p className="text-2xl font-bold text-primary">
              ${totalExpectedFunding.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Duration</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.ceil(steps.length / maxHardPulls48h) * 2} days
            </p>
          </div>
        </div>

        {/* Steps timeline */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const statusConfig = getStatusConfig(step.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                {/* Order number */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {step.order}
                </div>

                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{step.provider}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs border",
                      getRiskColor(step.riskLevel)
                    )}>
                      {step.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.action}</p>
                  {step.scheduledTime && (
                    <p className="text-xs text-primary mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {format(step.scheduledTime, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>

                {/* Expected amount */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    ${step.expectedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">expected</p>
                </div>

                {/* Status */}
                <div className={cn("flex items-center gap-1", statusConfig.color)}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm">{statusConfig.label}</span>
                </div>

                {/* Execute button */}
                {step.status === "scheduled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExecute(step.id)}
                  >
                    Execute
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={calculateSchedule}>
            <Calendar className="w-4 h-4 mr-2" />
            Calculate Schedule
          </Button>
          <Button variant="premium" className="flex-1">
            <Clock className="w-4 h-4 mr-2" />
            Start Sequence
          </Button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Important</p>
            <p className="text-muted-foreground">
              Executing this sequence will result in multiple hard inquiries on your credit report.
              Admin approval and your consent are required before execution.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
