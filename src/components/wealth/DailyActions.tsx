import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const dailyActions = [
  {
    title: "Check DoorDash peak pay zones",
    category: "Income",
    impact: "$50-150 potential",
    time: "5 min",
  },
  {
    title: "List 3 items for resale",
    category: "Income",
    impact: "$20-100 profit",
    time: "30 min",
  },
  {
    title: "Pay credit card balance",
    category: "Credit",
    impact: "Utilization drop",
    time: "2 min",
  },
  {
    title: "Apply for CLI (soft pull)",
    category: "Credit",
    impact: "+$500 limit",
    time: "5 min",
  },
];

export function DailyActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Today's Actions</h2>
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-3">
        {dailyActions.map((action, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium text-foreground">{action.title}</h4>
              <span className="text-xs text-muted-foreground">{action.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-secondary rounded text-secondary-foreground">
                {action.category}
              </span>
              <span className="text-xs text-success">{action.impact}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4">
        View All Actions
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
