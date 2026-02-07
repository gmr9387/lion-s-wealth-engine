import { useScoreHistory } from "@/hooks/useTradelines";
import { TimelineChart } from "@/components/TimelineChart";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ScoreHistoryChartProps {
  className?: string;
}

export function ScoreHistoryChart({ className }: ScoreHistoryChartProps) {
  const { data: scoreHistory, isLoading } = useScoreHistory();

  const hasRealData = scoreHistory && scoreHistory.length > 0;

  // Use real data if available, otherwise show demo projection
  const chartData = hasRealData
    ? scoreHistory.map((s) => ({
        date: s.date,
        score: s.score,
        projected: s.projected,
      }))
    : [
        { date: "Oct", score: 520 },
        { date: "Nov", score: 535 },
        { date: "Dec", score: 548 },
        { date: "Jan", score: 558 },
        { date: "Feb", score: 585, projected: true },
        { date: "Mar", score: 620, projected: true },
        { date: "Apr", score: 660, projected: true },
      ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Score Roadmap</h2>
          {!hasRealData && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Sample data
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
          30/60/90 day projection
        </span>
      </div>
      {isLoading ? (
        <div className="h-64 rounded-lg bg-muted/30 animate-pulse" />
      ) : (
        <TimelineChart data={chartData} targetScore={700} />
      )}
      {hasRealData && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-accent rounded border-dashed" style={{ borderTop: "2px dashed hsl(var(--accent))" }} />
            <span>Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-success rounded border-dashed" style={{ borderTop: "2px dashed hsl(var(--success))" }} />
            <span>Target (700)</span>
          </div>
        </div>
      )}
    </div>
  );
}
