import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target, DollarSign, TrendingUp, Briefcase, PiggyBank } from "lucide-react";
import { WealthPlan } from "@/types";

export interface WealthGoals {
  emergency_fund: number;
  credit_score: number;
  income_streams: number;
  savings_rate: number;
  timeline_months: number;
}

interface UpdateGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePlan: WealthPlan | null;
  onSave: (goals: WealthGoals) => void;
  saving: boolean;
}

export function UpdateGoalsDialog({
  open,
  onOpenChange,
  activePlan,
  onSave,
  saving,
}: UpdateGoalsDialogProps) {
  const goals = (activePlan?.goals as Record<string, any>) || {};

  const [emergencyFund, setEmergencyFund] = useState(goals.emergency_fund ?? 10000);
  const [creditScore, setCreditScore] = useState(goals.credit_score ?? 720);
  const [incomeStreams, setIncomeStreams] = useState(goals.income_streams ?? 3);
  const [savingsRate, setSavingsRate] = useState(goals.savings_rate ?? 30);
  const [timelineMonths, setTimelineMonths] = useState(activePlan?.timeline_months ?? 12);

  // Sync when plan changes
  useEffect(() => {
    if (activePlan) {
      const g = (activePlan.goals as Record<string, any>) || {};
      setEmergencyFund(g.emergency_fund ?? 10000);
      setCreditScore(g.credit_score ?? 720);
      setIncomeStreams(g.income_streams ?? 3);
      setSavingsRate(g.savings_rate ?? 30);
      setTimelineMonths(activePlan.timeline_months ?? 12);
    }
  }, [activePlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      emergency_fund: emergencyFund,
      credit_score: creditScore,
      income_streams: incomeStreams,
      savings_rate: savingsRate,
      timeline_months: timelineMonths,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Update Wealth Goals
          </DialogTitle>
          <DialogDescription>
            Adjust your financial targets to personalize your wealth plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Emergency Fund */}
          <div className="space-y-2">
            <Label htmlFor="emergency-fund" className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-success" />
              Emergency Fund Target
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="emergency-fund"
                type="number"
                min={500}
                max={1000000}
                step={500}
                value={emergencyFund}
                onChange={(e) => setEmergencyFund(Number(e.target.value))}
                className="pl-7"
              />
            </div>
          </div>

          {/* Credit Score */}
          <div className="space-y-2">
            <Label htmlFor="credit-score" className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              Target Credit Score
            </Label>
            <Input
              id="credit-score"
              type="number"
              min={300}
              max={850}
              step={10}
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
            />
          </div>

          {/* Income Streams */}
          <div className="space-y-2">
            <Label htmlFor="income-streams" className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-accent" />
              Income Stream Goal
            </Label>
            <Select value={String(incomeStreams)} onValueChange={(v) => setIncomeStreams(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} stream{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Savings Rate */}
          <div className="space-y-2">
            <Label htmlFor="savings-rate" className="flex items-center gap-2 text-sm">
              <PiggyBank className="w-4 h-4 text-warning" />
              Savings Rate Target
            </Label>
            <div className="relative">
              <Input
                id="savings-rate"
                type="number"
                min={5}
                max={80}
                step={5}
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
                className="pr-7"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm">
              Timeline (months)
            </Label>
            <Select value={String(timelineMonths)} onValueChange={(v) => setTimelineMonths(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 9, 12, 18, 24, 36].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="premium" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Goals"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
