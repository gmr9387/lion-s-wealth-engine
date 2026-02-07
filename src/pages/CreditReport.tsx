import { useState } from "react";
import { CreditScoreDial } from "@/components/CreditScoreDial";
import { Button } from "@/components/ui/button";
import { TradelineForm } from "@/components/TradelineForm";
import { ScoreInputModal } from "@/components/ScoreInputModal";
import { DisputeForm, DisputeFormData } from "@/components/DisputeForm";
import { ConsentModal } from "@/components/ConsentModal";
import { CreditReportUpload } from "@/components/CreditReportUpload";
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Plus,
  BarChart3,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradelines, useLatestScores, Tradeline } from "@/hooks/useTradelines";
import { useCreateTradeline, CreateTradelineData } from "@/hooks/useTradelineActions";
import { useCreditAnalysis } from "@/hooks/useCreditAnalysis";
import { useGenerateDispute } from "@/hooks/useGenerateDispute";
import { CreditBureau } from "@/types";
import { CreditReportSkeleton } from "@/components/SkeletonLoaders";
import { EmptyState } from "@/components/EmptyState";

export default function CreditReport() {
  const [expandedTradeline, setExpandedTradeline] = useState<string | null>(null);
  const [showTradelineForm, setShowTradelineForm] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTradelineForDispute, setSelectedTradelineForDispute] = useState<Tradeline | undefined>();
  const [pendingDisputeData, setPendingDisputeData] = useState<DisputeFormData | null>(null);
  
  const { data: tradelines, isLoading: tradelinesLoading, refetch: refetchTradelines } = useTradelines();
  const { data: latestScores, isLoading: scoresLoading, refetch: refetchScores } = useLatestScores();
  const createTradeline = useCreateTradeline();
  const { analyze, analyzing, result: analysisResult } = useCreditAnalysis();
  const { generate: generateDispute, generating: generatingDispute } = useGenerateDispute();

  const handleUploadSuccess = () => {
    refetchTradelines();
    refetchScores();
    setShowUpload(false);
  };

  // Use real data if available, otherwise show empty state
  const displayTradelines = tradelines || [];
  const displayScores = latestScores && latestScores.length > 0 ? latestScores : [];
  const hasData = displayTradelines.length > 0 || displayScores.length > 0;

  const negativeItems = displayTradelines.filter(t => t.isNegative);
  const positiveItems = displayTradelines.filter(t => !t.isNegative);
  const totalBalance = displayTradelines.reduce((acc, t) => acc + t.currentBalance, 0);
  const totalCredit = displayTradelines.filter(t => t.creditLimit > 0).reduce((acc, t) => acc + t.creditLimit, 0);
  const overallUtilization = totalCredit > 0 ? Math.round((totalBalance / totalCredit) * 100) : 0;

  const handleAddTradeline = async (data: CreateTradelineData) => {
    await createTradeline.mutateAsync({
      ...data,
      bureau: data.bureau as CreditBureau,
    });
  };

  const handleDisputeClick = (tradeline?: Tradeline) => {
    setSelectedTradelineForDispute(tradeline);
    setShowDisputeForm(true);
  };

  const handleDisputeSubmit = async (data: DisputeFormData) => {
    // Store the dispute data and show consent modal
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

  if (tradelinesLoading || scoresLoading) {
    return <CreditReportSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credit Report</h1>
          <p className="text-muted-foreground mt-1">
            Full analysis of your credit profile across all bureaus
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="w-4 h-4 mr-2" />
            Import PDF
          </Button>
          <Button variant="outline" onClick={() => setShowScoreModal(true)}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Add Score
          </Button>
          <Button variant="outline" onClick={() => analyze()} disabled={analyzing}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
          <Button variant="premium" onClick={() => setShowTradelineForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tradeline
          </Button>
        </div>
      </div>

      {/* PDF Upload Section */}
      {showUpload && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Import Credit Report</h2>
          <CreditReportUpload onSuccess={handleUploadSuccess} />
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <EmptyState
          icon={CreditCard}
          title="No Credit Data Yet"
          description="Start by adding your tradelines and credit scores from your credit reports. This data powers your action engine and funding projections."
          actionLabel="Add Tradeline"
          onAction={() => setShowTradelineForm(true)}
          secondaryLabel="Add Score"
          onSecondary={() => setShowScoreModal(true)}
          variant="bordered"
        />
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Analysis Complete</h3>
              <p className="text-sm text-muted-foreground">
                Score: {analysisResult.score} | Utilization: {analysisResult.utilization}% | 
                {analysisResult.recommendations.length} recommendations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bureau Scores */}
      {displayScores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayScores.map((bureau) => (
            <div
              key={bureau.bureau}
              className="rounded-xl border border-border bg-card p-4 sm:p-6 flex items-center gap-4 sm:gap-6"
            >
              <CreditScoreDial
                score={bureau.score || 0}
                bureau={bureau.bureau}
                className="scale-75"
              />
              <div>
                <span className="text-sm text-muted-foreground">{bureau.bureau}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-sm font-medium",
                    bureau.change > 0 ? "text-success" : bureau.change < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {bureau.change > 0 ? "+" : ""}{bureau.change} pts
                  </span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {displayTradelines.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold text-foreground">{displayTradelines.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Negative Items</p>
            <p className="text-2xl font-bold text-destructive">{negativeItems.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold text-foreground">${totalBalance.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className={cn(
              "text-2xl font-bold",
              overallUtilization > 50 ? "text-destructive" : overallUtilization > 30 ? "text-warning" : "text-success"
            )}>
              {overallUtilization}%
            </p>
          </div>
        </div>
      )}

      {/* Negative Items Section */}
      {negativeItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Negative Items</h2>
            <span className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs font-medium">
              {negativeItems.length} items
            </span>
          </div>
          <div className="space-y-3">
            {negativeItems.map((tradeline) => (
              <TradelineCard
                key={tradeline.id}
                tradeline={tradeline}
                expanded={expandedTradeline === tradeline.id}
                onToggle={() => setExpandedTradeline(
                  expandedTradeline === tradeline.id ? null : tradeline.id
                )}
                onDispute={() => handleDisputeClick(tradeline)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Positive Items Section */}
      {positiveItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold text-foreground">Positive Accounts</h2>
            <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs font-medium">
              {positiveItems.length} accounts
            </span>
          </div>
          <div className="space-y-3">
            {positiveItems.map((tradeline) => (
              <TradelineCard
                key={tradeline.id}
                tradeline={tradeline}
                expanded={expandedTradeline === tradeline.id}
                onToggle={() => setExpandedTradeline(
                  expandedTradeline === tradeline.id ? null : tradeline.id
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TradelineForm
        open={showTradelineForm}
        onOpenChange={setShowTradelineForm}
        onSubmit={handleAddTradeline}
      />

      <ScoreInputModal
        open={showScoreModal}
        onOpenChange={setShowScoreModal}
      />

      <DisputeForm
        open={showDisputeForm}
        onOpenChange={setShowDisputeForm}
        onSubmit={handleDisputeSubmit}
        tradelines={displayTradelines}
        preselectedTradeline={selectedTradelineForDispute}
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

function TradelineCard({
  tradeline,
  expanded,
  onToggle,
  onDispute,
}: {
  tradeline: Tradeline;
  expanded: boolean;
  onToggle: () => void;
  onDispute?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-all duration-300",
        tradeline.isNegative ? "border-destructive/30" : "border-border",
        expanded && "shadow-lg"
      )}
    >
      <div
        onClick={onToggle}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-card-hover transition-colors gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            tradeline.isNegative ? "bg-destructive/10" : "bg-success/10"
          )}>
            {tradeline.accountType === "Collection" ? (
              <AlertTriangle className={cn(
                "w-5 h-5",
                tradeline.isNegative ? "text-destructive" : "text-success"
              )} />
            ) : (
              <CreditCard className={cn(
                "w-5 h-5",
                tradeline.isNegative ? "text-destructive" : "text-success"
              )} />
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{tradeline.creditorName}</h3>
            <p className="text-sm text-muted-foreground">{tradeline.accountType}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
          <div className="text-left sm:text-right">
            <p className="font-medium text-foreground">
              ${tradeline.currentBalance.toLocaleString()}
            </p>
            {tradeline.creditLimit > 0 && (
              <p className="text-xs text-muted-foreground">
                of ${tradeline.creditLimit.toLocaleString()}
              </p>
            )}
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
            tradeline.isNegative
              ? "bg-destructive/20 text-destructive"
              : "bg-success/20 text-success"
          )}>
            {tradeline.paymentStatus}
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date Opened</p>
                <p className="text-sm font-medium text-foreground">{tradeline.dateOpened}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Credit Limit</p>
                <p className="text-sm font-medium text-foreground">
                  {tradeline.creditLimit > 0 ? `$${tradeline.creditLimit.toLocaleString()}` : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Utilization</p>
                <p className={cn(
                  "text-sm font-medium",
                  tradeline.utilization > 50 ? "text-destructive" : 
                  tradeline.utilization > 30 ? "text-warning" : "text-success"
                )}>
                  {tradeline.utilization > 0 ? `${tradeline.utilization}%` : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={cn(
                  "text-sm font-medium",
                  tradeline.isNegative ? "text-destructive" : "text-success"
                )}>
                  {tradeline.isNegative ? "Needs Action" : "Good Standing"}
                </p>
              </div>
            </div>
          </div>

          {tradeline.isNegative && onDispute && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="glow" size="sm" onClick={onDispute}>
                Dispute This Item
              </Button>
              <Button variant="outline" size="sm">
                View Options
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
