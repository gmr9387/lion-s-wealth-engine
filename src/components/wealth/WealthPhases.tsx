import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WealthPhasesProps {
  goals: Record<string, any>;
  timelineMonths: number;
}

const defaultPhases = [
  {
    phase: "Foundation",
    timeline: "Month 1-3",
    goals: [
      "Emergency fund: $1,000",
      "Credit score: 620+",
      "Income verification docs",
    ],
    status: "in-progress",
  },
  {
    phase: "Stability",
    timeline: "Month 4-6",
    goals: [
      "Emergency fund: $3,000",
      "Credit score: 680+",
      "2+ income streams",
      "Business entity formed",
    ],
    status: "upcoming",
  },
  {
    phase: "Growth",
    timeline: "Month 7-12",
    goals: [
      "Emergency fund: $10,000",
      "Credit score: 720+",
      "Business credit established",
      "Asset acquisition started",
    ],
    status: "upcoming",
  },
  {
    phase: "Acceleration",
    timeline: "Year 2+",
    goals: [
      "Net worth: $100,000+",
      "Multiple funding sources",
      "Real estate investment",
      "Passive income: $2,000+/mo",
    ],
    status: "future",
  },
];

const statusColors: Record<string, string> = {
  "in-progress": "border-primary bg-primary/5",
  upcoming: "border-border",
  future: "border-border",
};

export function WealthPhases({ goals, timelineMonths }: WealthPhasesProps) {
  const phases = defaultPhases;

  return (
    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Wealth Building Phases</h2>
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-4 transition-all",
              statusColors[phase.status] || "border-border"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  phase.status === "in-progress" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{phase.phase}</h3>
                  <p className="text-xs text-muted-foreground">{phase.timeline}</p>
                </div>
              </div>
              {phase.status === "in-progress" && (
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                  Current Phase
                </span>
              )}
            </div>
            <ul className="space-y-2 ml-11">
              {phase.goals.map((goal, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {phase.status === "in-progress" ? (
                    <Clock className="w-4 h-4 text-primary" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={phase.status === "in-progress" ? "text-foreground" : "text-muted-foreground"}>
                    {goal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
