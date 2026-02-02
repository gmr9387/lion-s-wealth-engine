import { TrendingUp, Calendar, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FundingProbabilityCardProps {
  targetAmount: number;
  probability: number;
  targetDate?: string;
  requirements?: string[];
  confidence: "high" | "medium" | "low";
  className?: string;
  onClick?: () => void;
}

const confidenceConfig = {
  high: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  medium: {
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  low: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

export function FundingProbabilityCard({
  targetAmount,
  probability,
  targetDate,
  requirements = [],
  confidence,
  className,
  onClick,
}: FundingProbabilityCardProps) {
  const config = confidenceConfig[confidence];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 sm:p-5 transition-all duration-300",
        "hover:shadow-lg cursor-pointer",
        config.border,
        className
      )}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(135deg, hsl(var(--${confidence === 'high' ? 'success' : confidence === 'medium' ? 'primary' : 'warning'}) / 0.1) 0%, transparent 60%)`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Funding Target</span>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Amount */}
        <div className="mb-3 sm:mb-4">
          <span className="text-2xl sm:text-3xl font-bold text-gradient-gold">
            {formatCurrency(targetAmount)}
          </span>
        </div>

        {/* Probability */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Approval Probability</span>
            <span className={cn("text-base sm:text-lg font-bold", config.color)}>
              {probability}%
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", config.bg.replace('/10', ''))}
              style={{ 
                width: `${probability}%`,
                background: `linear-gradient(90deg, hsl(var(--${confidence === 'high' ? 'success' : confidence === 'medium' ? 'primary' : 'warning'})) 0%, hsl(var(--${confidence === 'high' ? 'success' : confidence === 'medium' ? 'primary' : 'warning'}) / 0.7) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Target Date */}
        {targetDate && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Target: {targetDate}</span>
          </div>
        )}

        {/* Requirements Preview */}
        {requirements.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Key Requirements:</p>
            <div className="flex flex-wrap gap-1.5">
              {requirements.slice(0, 3).map((req, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                >
                  {req}
                </span>
              ))}
              {requirements.length > 3 && (
                <span className="px-2 py-0.5 text-muted-foreground text-xs">
                  +{requirements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
