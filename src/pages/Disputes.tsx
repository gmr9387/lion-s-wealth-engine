import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Eye,
  ChevronRight,
  Shield,
  Calendar,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Dispute {
  id: string;
  creditor: string;
  bureau: string;
  reason: string;
  status: "draft" | "pending_review" | "submitted" | "in_progress" | "resolved" | "rejected";
  dateCreated: string;
  dateSubmitted?: string;
  humanRequired: boolean;
}

const demoDisputes: Dispute[] = [
  {
    id: "1",
    creditor: "Discover",
    bureau: "Experian",
    reason: "30-day late payment - goodwill removal request",
    status: "pending_review",
    dateCreated: "Dec 1, 2024",
    humanRequired: true,
  },
  {
    id: "2",
    creditor: "Collections Agency",
    bureau: "TransUnion",
    reason: "Debt validation request - unverified collection",
    status: "submitted",
    dateCreated: "Nov 28, 2024",
    dateSubmitted: "Nov 30, 2024",
    humanRequired: true,
  },
  {
    id: "3",
    creditor: "Capital One",
    bureau: "Equifax",
    reason: "Balance reporting error",
    status: "in_progress",
    dateCreated: "Nov 15, 2024",
    dateSubmitted: "Nov 17, 2024",
    humanRequired: false,
  },
  {
    id: "4",
    creditor: "Medical Bill",
    bureau: "All Bureaus",
    reason: "HIPAA violation - medical debt dispute",
    status: "resolved",
    dateCreated: "Oct 20, 2024",
    dateSubmitted: "Oct 22, 2024",
    humanRequired: true,
  },
];

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  rejected: {
    label: "Rejected",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export default function Disputes() {
  const [filter, setFilter] = useState<string>("all");

  const filteredDisputes = filter === "all" 
    ? demoDisputes 
    : demoDisputes.filter(d => d.status === filter);

  const stats = {
    total: demoDisputes.length,
    pending: demoDisputes.filter(d => ["draft", "pending_review"].includes(d.status)).length,
    active: demoDisputes.filter(d => ["submitted", "in_progress"].includes(d.status)).length,
    resolved: demoDisputes.filter(d => d.status === "resolved").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispute Center</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your credit disputes
          </p>
        </div>
        <Button variant="premium">
          <Plus className="w-4 h-4 mr-2" />
          New Dispute
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-all",
            filter === "all" ? "border-primary shadow-glow" : "border-border hover:border-primary/30"
          )}
        >
          <p className="text-sm text-muted-foreground">Total Disputes</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </button>
        <button
          onClick={() => setFilter("pending_review")}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-all",
            filter === "pending_review" ? "border-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)]" : "border-border hover:border-warning/30"
          )}
        >
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-all",
            filter === "in_progress" ? "border-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]" : "border-border hover:border-accent/30"
          )}
        >
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-accent">{stats.active}</p>
        </button>
        <button
          onClick={() => setFilter("resolved")}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-all",
            filter === "resolved" ? "border-success shadow-[0_0_15px_hsl(var(--success)/0.3)]" : "border-border hover:border-success/30"
          )}
        >
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-success">{stats.resolved}</p>
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">FCRA Compliant Disputes</p>
          <p className="text-xs text-muted-foreground">
            All disputes are generated following Fair Credit Reporting Act guidelines and require 
            your e-signature consent before submission.
          </p>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-3">
        {filteredDisputes.map((dispute) => {
          const config = statusConfig[dispute.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={dispute.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <StatusIcon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{dispute.creditor}</h3>
                      {dispute.humanRequired && (
                        <Shield className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{dispute.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {dispute.bureau}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created {dispute.dateCreated}
                      </span>
                      {dispute.dateSubmitted && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Submitted {dispute.dateSubmitted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    config.bg,
                    config.color
                  )}>
                    {config.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Action buttons for pending disputes */}
              {dispute.status === "pending_review" && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="glow" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Review & Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Letter
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredDisputes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No disputes found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === "all" 
              ? "Start a new dispute to improve your credit report"
              : `No disputes with status "${filter}"`
            }
          </p>
          <Button variant="premium">
            <Plus className="w-4 h-4 mr-2" />
            Create Dispute
          </Button>
        </div>
      )}
    </div>
  );
}
