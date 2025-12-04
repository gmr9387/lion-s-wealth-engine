import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface AdminApprovalBadgeProps {
  status: ApprovalStatus;
  className?: string;
  showLabel?: boolean;
}

export function AdminApprovalBadge({
  status,
  className,
  showLabel = true,
}: AdminApprovalBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      label: "Pending Review",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      className: "bg-success/10 text-success border-success/20",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const { icon: Icon, label, className: statusClass } = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium",
        statusClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {showLabel && <span>{label}</span>}
    </div>
  );
}

interface HumanRequiredBadgeProps {
  className?: string;
}

export function HumanRequiredBadge({ className }: HumanRequiredBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium",
        "bg-primary/10 text-primary border-primary/20",
        className
      )}
    >
      <Shield className="w-3 h-3" />
      <span>Requires Approval</span>
    </div>
  );
}
