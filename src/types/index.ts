// Lion's Wealth Engine — Type Definitions

import { Database } from "@/integrations/supabase/types";

// Re-export database types
export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

// Action Types
export type Action = Tables["actions"]["Row"];
export type ActionInsert = Tables["actions"]["Insert"];
export type ActionUpdate = Tables["actions"]["Update"];
export type ActionPriority = Enums["action_priority"];
export type ActionStatus = Enums["action_status"];

// Credit Types
export type CreditReport = Tables["credit_reports"]["Row"];
export type CreditReportInsert = Tables["credit_reports"]["Insert"];
export type Tradeline = Tables["tradelines"]["Row"];
export type TradelineInsert = Tables["tradelines"]["Insert"];
export type CreditBureau = Enums["credit_bureau"];
export type ScoreHistory = Tables["score_history"]["Row"];

// Dispute Types
export type Dispute = Tables["disputes"]["Row"];
export type DisputeInsert = Tables["disputes"]["Insert"];
export type DisputeUpdate = Tables["disputes"]["Update"];
export type DisputeStatus = Enums["dispute_status"];

// Funding Types
export type FundingProjection = Tables["funding_projections"]["Row"];
export type FundingProjectionInsert = Tables["funding_projections"]["Insert"];

// Wealth Types
export type WealthPlan = Tables["wealth_plans"]["Row"];
export type WealthPlanInsert = Tables["wealth_plans"]["Insert"];

// User Types
export type Profile = Tables["profiles"]["Row"];
export type ProfileUpdate = Tables["profiles"]["Update"];
export type UserRole = Tables["user_roles"]["Row"];
export type AppRole = Enums["app_role"];

// Consent Types
export type Consent = Tables["consents"]["Row"];
export type ConsentInsert = Tables["consents"]["Insert"];

// Admin Types
export type AdminApproval = Tables["admin_approvals"]["Row"];
export type AdminApprovalInsert = Tables["admin_approvals"]["Insert"];

// UI Types
export interface NextBestMove {
  id: string;
  title: string;
  description: string;
  impact: number;
  urgency: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  category: string;
  humanRequired: boolean;
}

export interface FundingTarget {
  amount: number;
  probability: number;
  confidence: "high" | "medium" | "low";
  targetDate: string;
  requirements: string[];
  assumptions?: string[];
}

export interface CreditAnalysis {
  score: number;
  scoreChange: number;
  utilization: number;
  negativeItems: number;
  oldestAccount: string;
  totalAccounts: number;
  hardInquiries: number;
  recommendations: NextBestMove[];
}

export interface MillionModeSequence {
  id: string;
  step: number;
  action: string;
  provider: string;
  expectedAmount: number;
  timing: string;
  requirements: string[];
  riskLevel: "low" | "medium" | "high";
  humanRequired: boolean;
}

export interface WealthForecast {
  month: number;
  projectedNetWorth: number;
  projectedIncome: number;
  projectedSavings: number;
  confidence: number;
}

export interface BusinessSetup {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  documentsRequired: string[];
  estimatedTime: string;
}

export interface IncomeStream {
  id: string;
  name: string;
  type: "active" | "semi-passive" | "passive";
  estimatedMonthly: number;
  timeInvestment: string;
  requirements: string[];
  difficulty: "easy" | "medium" | "hard";
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form Types
export interface DisputeFormData {
  bureau: CreditBureau;
  tradelineId?: string;
  reason: string;
  evidence: string[];
  consentId: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone?: string;
}
