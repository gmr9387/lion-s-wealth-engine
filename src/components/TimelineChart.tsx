import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

interface TimelineDataPoint {
  date: string;
  score: number;
  projected?: boolean;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
  targetScore?: number;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground">
          {data.score}
          {data.projected && (
            <span className="text-xs text-muted-foreground ml-1">(projected)</span>
          )}
        </p>
      </div>
    );
  }
  return null;
};

export function TimelineChart({ data, targetScore, className }: TimelineChartProps) {
  const actualData = data.filter(d => !d.projected);
  const projectedData = data.filter(d => d.projected);
  const lastActual = actualData[actualData.length - 1];
  const combinedProjected = lastActual ? [lastActual, ...projectedData] : projectedData;

  return (
    <div className={cn("w-full h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dx={-10}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {targetScore && (
            <ReferenceLine
              y={targetScore}
              stroke="hsl(var(--success))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Target: ${targetScore}`,
                position: "right",
                fill: "hsl(var(--success))",
                fontSize: 12,
              }}
            />
          )}

          {/* Actual data area */}
          <Area
            type="monotone"
            dataKey="score"
            data={actualData}
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              stroke: "hsl(var(--card))",
              r: 4,
            }}
            activeDot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 3,
              stroke: "hsl(var(--card))",
              r: 6,
            }}
          />

          {/* Projected data area */}
          {combinedProjected.length > 1 && (
            <Area
              type="monotone"
              dataKey="score"
              data={combinedProjected}
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="8 4"
              fill="url(#projectedGradient)"
              dot={{
                fill: "hsl(var(--accent))",
                strokeWidth: 2,
                stroke: "hsl(var(--card))",
                r: 3,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
