import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionTask {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "requires_approval";
  priority: "critical" | "high" | "medium" | "low";
  estimatedImpact?: number;
  dueDate?: string;
  humanRequired?: boolean;
}

interface ActionTaskListProps {
  tasks: ActionTask[];
  onTaskClick?: (task: ActionTask) => void;
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
};

const priorityColors = {
  critical: "border-l-destructive",
  high: "border-l-warning",
  medium: "border-l-primary",
  low: "border-l-muted",
};

export function ActionTaskList({ tasks, onTaskClick, className }: ActionTaskListProps) {
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
              "transition-all duration-200 cursor-pointer",
              "hover:bg-card-hover hover:border-primary/30",
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

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        );
      })}
    </div>
  );
}
