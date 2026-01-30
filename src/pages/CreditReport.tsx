import { useState } from "react";
import { CreditScoreDial } from "@/components/CreditScoreDial";
import { Button } from "@/components/ui/button";
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
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradelines, useLatestScores, Tradeline } from "@/hooks/useTradelines";

// Demo data as fallback
const demoTradelines: Tradeline[] = [
  {
    id: "1",
    creditorName: "Capital One",
    accountType: "Credit Card",
    creditLimit: 3000,
    currentBalance: 2680,
    paymentStatus: "Current",
    isNegative: false,
    dateOpened: "Jan 2022",
    utilization: 89,
    bureau: null,
  },
  {
    id: "2",
    creditorName: "Discover",
    accountType: "Credit Card",
    creditLimit: 1500,
    currentBalance: 450,
    paymentStatus: "30 Days Late (Mar 2024)",
    isNegative: true,
    dateOpened: "Jun 2021",
    utilization: 30,
    bureau: null,
  },
  {
    id: "3",
    creditorName: "Chase",
    accountType: "Credit Card",
    creditLimit: 500,
    currentBalance: 125,
    paymentStatus: "Current",
    isNegative: false,
    dateOpened: "Sep 2023",
    utilization: 25,
    bureau: null,
  },
  {
    id: "4",
    creditorName: "Collections Agency",
    accountType: "Collection",
    creditLimit: 0,
    currentBalance: 847,
    paymentStatus: "In Collections",
    isNegative: true,
    dateOpened: "Aug 2024",
    utilization: 0,
    bureau: null,
  },
];

const demoBureauScores = [
  { bureau: "Experian", score: 562, change: 12 },
  { bureau: "TransUnion", score: 558, change: 15 },
  { bureau: "Equifax", score: 554, change: 8 },
];

export default function CreditReport() {
  const [expandedTradeline, setExpandedTradeline] = useState<string | null>(null);
  
  const { data: tradelines, isLoading: tradelinesLoading } = useTradelines();
  const { data: latestScores, isLoading: scoresLoading } = useLatestScores();

  // Use real data if available, otherwise fall back to demo
  const displayTradelines = tradelines && tradelines.length > 0 ? tradelines : demoTradelines;
  const displayScores = latestScores && latestScores.length > 0 ? latestScores : demoBureauScores;
  const isDemo = !tradelines || tradelines.length === 0;

  const negativeItems = displayTradelines.filter(t => t.isNegative);
  const positiveItems = displayTradelines.filter(t => !t.isNegative);
  const totalBalance = displayTradelines.reduce((acc, t) => acc + t.currentBalance, 0);
  const totalCredit = displayTradelines.filter(t => t.creditLimit > 0).reduce((acc, t) => acc + t.creditLimit, 0);
  const overallUtilization = totalCredit > 0 ? Math.round((totalBalance / totalCredit) * 100) : 0;

  if (tradelinesLoading || scoresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading credit report...</div>
      </div>
    );
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
        <Button variant="premium">
          <Plus className="w-4 h-4 mr-2" />
          Add Tradeline
        </Button>
      </div>

      {/* Demo Notice */}
      {isDemo && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Demo Data</p>
            <p className="text-xs text-muted-foreground">
              You're viewing sample data. Add your tradelines to see your real credit report.
            </p>
          </div>
        </div>
      )}

      {/* Bureau Scores */}
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

      {/* Summary Stats */}
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
              />
            ))}
          </div>
        </div>
      )}

      {/* Positive Items Section */}
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
    </div>
  );
}

function TradelineCard({
  tradeline,
  expanded,
  onToggle,
}: {
  tradeline: Tradeline;
  expanded: boolean;
  onToggle: () => void;
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

          {tradeline.isNegative && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="glow" size="sm">
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
