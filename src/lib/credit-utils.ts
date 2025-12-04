// Credit Score Utilities

export type ScoreRange = "excellent" | "good" | "fair" | "poor" | "very_poor";

export function getScoreRange(score: number): ScoreRange {
  if (score >= 750) return "excellent";
  if (score >= 700) return "good";
  if (score >= 650) return "fair";
  if (score >= 550) return "poor";
  return "very_poor";
}

export function getScoreColor(score: number): string {
  const range = getScoreRange(score);
  switch (range) {
    case "excellent": return "hsl(var(--success))";
    case "good": return "hsl(142, 76%, 36%)";
    case "fair": return "hsl(var(--warning))";
    case "poor": return "hsl(25, 95%, 53%)";
    case "very_poor": return "hsl(var(--destructive))";
  }
}

export function getScoreLabel(score: number): string {
  const range = getScoreRange(score);
  switch (range) {
    case "excellent": return "Excellent";
    case "good": return "Good";
    case "fair": return "Fair";
    case "poor": return "Poor";
    case "very_poor": return "Very Poor";
  }
}

export function calculateUtilization(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((balance / limit) * 100);
}

export function getUtilizationImpact(utilization: number): {
  impact: "positive" | "neutral" | "negative" | "severe";
  points: number;
  recommendation: string;
} {
  if (utilization <= 10) {
    return {
      impact: "positive",
      points: 0,
      recommendation: "Excellent! Keep utilization under 10% for optimal scores.",
    };
  }
  if (utilization <= 30) {
    return {
      impact: "neutral",
      points: -5,
      recommendation: "Good utilization. Consider paying down to under 10% for maximum benefit.",
    };
  }
  if (utilization <= 50) {
    return {
      impact: "negative",
      points: -20,
      recommendation: "High utilization hurting your score. Pay down to under 30%.",
    };
  }
  if (utilization <= 75) {
    return {
      impact: "negative",
      points: -40,
      recommendation: "Very high utilization. Prioritize paying down balances immediately.",
    };
  }
  return {
    impact: "severe",
    points: -60,
    recommendation: "Critical: Maxed out credit severely impacts score. Pay down ASAP.",
  };
}

export function estimateScoreImpact(actions: {
  utilizationReduction?: number;
  negativeItemRemoval?: boolean;
  newAccountAge?: number;
  hardInquiry?: boolean;
  latePaymentRemoval?: boolean;
}): number {
  let impact = 0;

  if (actions.utilizationReduction) {
    // Rough estimate: every 10% reduction = 5-15 points
    impact += Math.round(actions.utilizationReduction / 10) * 10;
  }

  if (actions.negativeItemRemoval) {
    impact += 20; // Conservative estimate
  }

  if (actions.latePaymentRemoval) {
    impact += 25;
  }

  if (actions.hardInquiry) {
    impact -= 5;
  }

  if (actions.newAccountAge) {
    // New accounts temporarily lower score
    impact -= 10;
  }

  return impact;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMonthsFromNow(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Million Mode calculations
export function calculateMillionModeProbability(
  currentScore: number,
  inquiriesLast24Months: number,
  accountAge: number
): { probability: number; risk: "low" | "medium" | "high"; warnings: string[] } {
  const warnings: string[] = [];
  let probability = 0;

  // Base probability from score
  if (currentScore >= 750) probability = 85;
  else if (currentScore >= 720) probability = 75;
  else if (currentScore >= 700) probability = 60;
  else if (currentScore >= 680) probability = 45;
  else probability = 25;

  // Adjust for inquiries
  if (inquiriesLast24Months > 6) {
    probability -= 20;
    warnings.push("High number of recent inquiries may reduce approval odds");
  } else if (inquiriesLast24Months > 3) {
    probability -= 10;
  }

  // Adjust for account age
  if (accountAge < 12) {
    probability -= 15;
    warnings.push("Limited credit history may affect high-limit approvals");
  } else if (accountAge < 24) {
    probability -= 5;
  }

  // Determine risk level
  const risk = probability >= 60 ? "low" : probability >= 35 ? "medium" : "high";

  if (risk === "high") {
    warnings.push("Consider improving score before attempting Million Mode");
  }

  return {
    probability: Math.max(10, Math.min(95, probability)),
    risk,
    warnings,
  };
}

// Dispute reason templates
export const DISPUTE_REASONS = {
  not_mine: {
    label: "Account Not Mine",
    template: "I do not recognize this account. This account does not belong to me and may be the result of identity theft or a mixed credit file.",
  },
  inaccurate_balance: {
    label: "Inaccurate Balance",
    template: "The balance reported on this account is inaccurate. My records show a different balance than what is being reported.",
  },
  inaccurate_payment: {
    label: "Inaccurate Payment Status",
    template: "The payment status reported on this account is inaccurate. I have records showing payments were made on time.",
  },
  paid_collection: {
    label: "Paid Collection",
    template: "This collection account has been paid in full. Please update the status to reflect this or remove the account.",
  },
  statute_of_limitations: {
    label: "Beyond Statute of Limitations",
    template: "This debt is beyond the statute of limitations for reporting and should be removed from my credit report.",
  },
  goodwill: {
    label: "Goodwill Adjustment",
    template: "I am requesting a goodwill adjustment to remove this late payment. I have been a loyal customer and this was an isolated incident.",
  },
  duplicate: {
    label: "Duplicate Account",
    template: "This account appears to be a duplicate entry. The same account is being reported multiple times.",
  },
};
