import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
  variant?: "default" | "bordered";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-12 px-6 rounded-xl",
        variant === "bordered" && "border border-primary/30 bg-primary/5",
        variant === "default" && "border border-border bg-card",
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-wrap justify-center gap-3">
          {secondaryLabel && onSecondary && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button variant="premium" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
