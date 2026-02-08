import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DisputeForm, DisputeFormData } from "@/components/DisputeForm";
import { ConsentModal } from "@/components/ConsentModal";
import { EmptyState } from "@/components/EmptyState";
import { DisputesSkeleton } from "@/components/SkeletonLoaders";
import { DisputePdfExport } from "@/components/DisputePdfExport";
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
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisputes } from "@/hooks/useDisputes";
import { useGenerateDispute } from "@/hooks/useGenerateDispute";
import { useTradelines } from "@/hooks/useTradelines";

interface DisputeDisplay {
  id: string;
  creditor: string;
  bureau: string;
  reason: string;
  status: "draft" | "pending_review" | "submitted" | "in_progress" | "resolved" | "rejected";
  dateCreated: string;
  dateSubmitted?: string;
  humanRequired: boolean;
  letterPreview?: string;
  letterContent?: string;
  tradelineId?: string;
}

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  pending_review: { label: "Pending Review", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  submitted: { label: "Submitted", icon: Send, color: "text-primary", bg: "bg-primary/10" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  rejected: { label: "Rejected", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Disputes() {
  const [filter, setFilter] = useState<string>("all");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingDisputeData, setPendingDisputeData] = useState<DisputeFormData | null>(null);
  const [editingDispute, setEditingDispute] = useState<DisputeDisplay | null>(null);
  const [selectedTradelineForDispute, setSelectedTradelineForDispute] = useState<string | undefined>();
  
  const { data: disputes, isLoading } = useDisputes();
  const { data: tradelines } = useTradelines();
  const { generate: generateDispute, generating } = useGenerateDispute();
  const { toast } = useToast();

  const displayDisputes: DisputeDisplay[] = disputes
    ? disputes.map(d => ({
        id: d.id,
        creditor: d.tradelines?.creditor_name || "Unknown Creditor",
        bureau: d.bureau.charAt(0).toUpperCase() + d.bureau.slice(1),
        reason: d.reason,
        status: d.status || "draft",
        dateCreated: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dateSubmitted: d.submitted_at 
          ? new Date(d.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : undefined,
        humanRequired: d.human_required || true,
        letterPreview: d.letter_content?.substring(0, 200) || undefined,
        letterContent: d.letter_content || undefined,
        tradelineId: d.tradeline_id || undefined,
      }))
    : [];

  const filteredDisputes = filter === "all" 
    ? displayDisputes 
    : displayDisputes.filter(d => d.status === filter);

  const stats = {
    total: displayDisputes.length,
    pending: displayDisputes.filter(d => ["draft", "pending_review"].includes(d.status)).length,
    active: displayDisputes.filter(d => ["submitted", "in_progress"].includes(d.status)).length,
    resolved: displayDisputes.filter(d => d.status === "resolved").length,
  };

  const handleDisputeSubmit = async (data: DisputeFormData) => {
    setPendingDisputeData(data);
    setShowDisputeForm(false);
    setShowConsentModal(true);
  };

  const handleConsentComplete = async (consentId: string) => {
    if (pendingDisputeData) {
      await generateDispute({
        tradelineId: pendingDisputeData.tradelineId,
        bureau: pendingDisputeData.bureau,
        reason: `${pendingDisputeData.disputeType}: ${pendingDisputeData.reason}`,
        consentId,
      });
      setPendingDisputeData(null);
    }
    setShowConsentModal(false);
  };

  const handleApproveDispute = async (disputeId: string) => {
    try {
      const { error } = await supabase
        .from("disputes")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", disputeId);
      if (error) throw error;
      toast({ title: "Dispute approved and submitted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <DisputesSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispute Center</h1>
          <p className="text-muted-foreground mt-1">Track and manage your credit disputes</p>
        </div>
        <Button variant="premium" onClick={() => setShowDisputeForm(true)}>
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
        <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">FCRA Compliant Disputes</p>
          <p className="text-xs text-muted-foreground">
            All disputes are generated following Fair Credit Reporting Act guidelines and require 
            your e-signature consent before submission.
          </p>
        </div>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length > 0 ? (
        <div className="space-y-3">
          {filteredDisputes.map((dispute) => {
            const config = statusConfig[dispute.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={dispute.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
                      <StatusIcon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{dispute.creditor}</h3>
                        {dispute.humanRequired && <Shield className="w-4 h-4 text-warning" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{dispute.reason}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      config.bg,
                      config.color
                    )}>
                      {config.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                  </div>
                </div>

                {/* Action buttons */}
                {(dispute.status === "pending_review" || dispute.letterContent) && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                    {dispute.status === "pending_review" && (
                      <>
                        <Button 
                          variant="glow" 
                          size="sm"
                          onClick={() => {
                            // Submit the dispute (change status to submitted)
                            handleApproveDispute(dispute.id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review & Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTradelineForDispute(dispute.tradelineId);
                            setShowDisputeForm(true);
                          }}
                        >
                          Edit Letter
                        </Button>
                      </>
                    )}
                    {dispute.letterContent && (
                      <DisputePdfExport
                        letterContent={dispute.letterContent}
                        creditorName={dispute.creditor}
                        bureau={dispute.bureau}
                        disputeId={dispute.id}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={filter === "all" ? "No disputes yet" : `No ${filter.replace("_", " ")} disputes`}
          description={
            filter === "all"
              ? "Start a new dispute to challenge inaccurate items on your credit report. Our AI generates FCRA-compliant letters in seconds."
              : "No disputes match this filter. Try selecting a different status or create a new dispute."
          }
          actionLabel={filter === "all" ? "Create Your First Dispute" : undefined}
          onAction={filter === "all" ? () => setShowDisputeForm(true) : undefined}
          variant="bordered"
        />
      )}

      {/* Modals */}
      <DisputeForm
        open={showDisputeForm}
        onOpenChange={setShowDisputeForm}
        onSubmit={handleDisputeSubmit}
        tradelines={tradelines || []}
      />

      <ConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        consentType="credit_dispute"
        title="Dispute Authorization"
        description="Review and sign to authorize this credit dispute"
        onConsent={handleConsentComplete}
        onCancel={() => setPendingDisputeData(null)}
      />
    </div>
  );
}
