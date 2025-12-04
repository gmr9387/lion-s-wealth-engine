import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  AlertTriangle,
  User,
  Mail,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = 
  | "created" 
  | "submitted" 
  | "pending_review" 
  | "approved" 
  | "rejected" 
  | "completed"
  | "consent_signed"
  | "letter_sent"
  | "response_received";

interface AuditEvent {
  id: string;
  type: EventType;
  timestamp: string;
  actor?: string;
  details?: string;
}

interface AuditTimelineProps {
  events: AuditEvent[];
  className?: string;
}

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  const getEventConfig = (type: EventType) => {
    switch (type) {
      case "created":
        return {
          icon: FileText,
          label: "Created",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        };
      case "submitted":
        return {
          icon: Mail,
          label: "Submitted",
          color: "text-primary",
          bgColor: "bg-primary/10",
        };
      case "pending_review":
        return {
          icon: Clock,
          label: "Pending Review",
          color: "text-warning",
          bgColor: "bg-warning/10",
        };
      case "approved":
        return {
          icon: CheckCircle,
          label: "Approved",
          color: "text-success",
          bgColor: "bg-success/10",
        };
      case "rejected":
        return {
          icon: AlertTriangle,
          label: "Rejected",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        };
      case "completed":
        return {
          icon: CheckCircle,
          label: "Completed",
          color: "text-success",
          bgColor: "bg-success/10",
        };
      case "consent_signed":
        return {
          icon: Shield,
          label: "Consent Signed",
          color: "text-primary",
          bgColor: "bg-primary/10",
        };
      case "letter_sent":
        return {
          icon: Mail,
          label: "Letter Sent",
          color: "text-accent",
          bgColor: "bg-accent/10",
        };
      case "response_received":
        return {
          icon: CreditCard,
          label: "Response Received",
          color: "text-success",
          bgColor: "bg-success/10",
        };
    }
  };

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const config = getEventConfig(event.type);
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={cn("p-2 rounded-full", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              {!isLast && (
                <div className="w-px h-full min-h-[2rem] bg-border" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("font-medium", config.color)}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {event.actor && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <User className="w-3 h-3" />
                  <span>{event.actor}</span>
                </div>
              )}
              {event.details && (
                <p className="text-sm text-muted-foreground">{event.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
