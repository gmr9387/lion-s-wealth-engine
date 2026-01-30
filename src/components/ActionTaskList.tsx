import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronRight, Shield, Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ActionTask {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "requires_approval" | "failed";
  priority: "critical" | "high" | "medium" | "low";
  estimatedImpact?: number;
  dueDate?: string;
  humanRequired?: boolean;
}

interface ActionTaskListProps {
  tasks: ActionTask[];
  onTaskClick?: (task: ActionTask) => void;
  onComplete?: (taskId: string) => void;
  onStart?: (taskId: string) => void;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  },
  in_progress: {
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  requires_approval: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  failed: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

const priorityColors = {
  critical: "border-l-destructive",
  high: "border-l-warning",
  medium: "border-l-primary",
  low: "border-l-muted",
};

export function ActionTaskList({ tasks, onTaskClick, onComplete, onStart, className }: ActionTaskListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {tasks.map((task, index) => {
        const config = statusConfig[task.status];
        const StatusIcon = config.icon;

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task)}
            className={cn(
              "group relative flex items-center gap-4 p-4 rounded-lg border-l-4 bg-card border border-border",
              "transition-all duration-200",
              onTaskClick && "cursor-pointer hover:bg-card-hover hover:border-primary/30",
              priorityColors[task.priority],
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Status Icon */}
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <StatusIcon className={cn("w-5 h-5", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {task.title}
                </h4>
                {task.humanRequired && (
                  <Shield className="w-4 h-4 text-warning flex-shrink-0" />
                )}
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {task.estimatedImpact && (
                  <span className="text-xs text-success font-medium">
                    +{task.estimatedImpact} pts
                  </span>
                )}
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {task.dueDate}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {task.status === "pending" && onStart && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(task.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              {task.status === "in_progress" && onComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                  }}
                  className="h-8 w-8 p-0 text-success hover:text-success"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              {onTaskClick && (
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
