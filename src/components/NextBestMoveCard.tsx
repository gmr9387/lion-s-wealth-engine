import { ArrowRight, Zap, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NextBestMoveCardProps {
  title: string;
  description: string;
  impact: number;
  urgency: "critical" | "high" | "medium" | "low";
  estimatedTime?: string;
  category: string;
  onAction?: () => void;
  className?: string;
}

const urgencyConfig = {
  critical: {
    label: "Critical",
    color: "bg-destructive/20 text-destructive border-destructive/50",
    glow: "shadow-[0_0_15px_hsl(var(--destructive)/0.3)]",
  },
  high: {
    label: "High Priority",
    color: "bg-warning/20 text-warning border-warning/50",
    glow: "shadow-[0_0_15px_hsl(var(--warning)/0.3)]",
  },
  medium: {
    label: "Recommended",
    color: "bg-primary/20 text-primary border-primary/50",
    glow: "shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
  },
  low: {
    label: "Optional",
    color: "bg-muted text-muted-foreground border-muted",
    glow: "",
  },
};

export function NextBestMoveCard({
  title,
  description,
  impact,
  urgency,
  estimatedTime,
  category,
  onAction,
  className,
}: NextBestMoveCardProps) {
  const config = urgencyConfig[urgency];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6 transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg",
        config.glow,
        className
      )}
    >
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {category}
            </span>
          </div>
          <span className={cn(
            "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border flex-shrink-0",
            config.color
          )}>
            {config.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
            <span className="text-success font-medium">+{impact} pts</span>
            <span className="text-muted-foreground hidden xs:inline">potential</span>
          </div>
          {estimatedTime && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button 
          variant="glow" 
          size="sm" 
          className="w-full group/btn"
          onClick={onAction}
        >
          <span>Take Action</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
