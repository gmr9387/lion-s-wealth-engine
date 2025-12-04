import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProbabilityBadgeProps {
  probability: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function ProbabilityBadge({
  probability,
  size = "md",
  showIcon = true,
  className,
}: ProbabilityBadgeProps) {
  const getConfig = () => {
    if (probability >= 70) {
      return {
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        icon: TrendingUp,
        label: "High",
      };
    }
    if (probability >= 40) {
      return {
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        icon: Minus,
        label: "Medium",
      };
    }
    return {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      icon: TrendingDown,
      label: "Low",
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{probability}%</span>
    </div>
  );
}

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  size = "md",
  className,
}: ConfidenceBadgeProps) {
  const config = {
    high: {
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      label: "High Confidence",
    },
    medium: {
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      label: "Medium Confidence",
    },
    low: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      label: "Low Confidence",
    },
  };

  const { color, bgColor, borderColor, label } = config[confidence];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        bgColor,
        borderColor,
        color,
        sizeClasses[size],
        className
      )}
    >
      {label}
    </div>
  );
}
