import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
          <div className={cn("p-2 rounded-lg bg-primary/10", iconColor.replace('text-', 'bg-').replace('primary', 'primary/10'))}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>

        {/* Value */}
        <div className="text-2xl font-bold text-foreground mb-2">{value}</div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive && <TrendingUp className="w-4 h-4 text-success" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-destructive" />}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive && "text-success",
                isNegative && "text-destructive",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
            >
              {isPositive && "+"}
              {change}
              {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
