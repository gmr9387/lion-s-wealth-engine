import { z } from "zod";

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Profile schemas
export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number").optional().or(z.literal("")),
});

// Dispute schemas
export const disputeSchema = z.object({
  bureau: z.enum(["experian", "equifax", "transunion"], {
    required_error: "Please select a bureau",
  }),
  tradelineId: z.string().uuid().optional(),
  reason: z.string().min(10, "Please provide a detailed reason for the dispute"),
  evidence: z.array(z.string()).optional(),
});

// Credit report import schema
export const creditReportImportSchema = z.object({
  bureau: z.enum(["experian", "equifax", "transunion"]),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  score: z.number().min(300).max(850).optional(),
  rawData: z.record(z.unknown()).optional(),
});

// Tradeline schema
export const tradelineSchema = z.object({
  creditorName: z.string().min(1, "Creditor name is required"),
  accountType: z.string().optional(),
  accountNumberMasked: z.string().optional(),
  currentBalance: z.number().min(0).optional(),
  creditLimit: z.number().min(0).optional(),
  paymentStatus: z.string().optional(),
  isNegative: z.boolean().optional(),
  dateOpened: z.string().optional(),
  dateReported: z.string().optional(),
});

// Funding projection schema
export const fundingProjectionSchema = z.object({
  targetAmount: z.number().min(1000, "Minimum target is $1,000"),
  targetDate: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  requirements: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});

// Wealth plan schema
export const wealthPlanSchema = z.object({
  planType: z.string().min(1, "Plan type is required"),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    targetAmount: z.number(),
    targetDate: z.string().optional(),
    priority: z.number(),
  })).optional(),
  timelineMonths: z.number().min(1).max(120).optional(),
  strategies: z.array(z.string()).optional(),
});

// Action schema
export const actionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  actionType: z.string().min(1, "Action type is required"),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  dueDate: z.string().optional(),
  estimatedImpact: z.number().min(0).max(100).optional(),
  humanRequired: z.boolean().optional(),
});

// Consent schema
export const consentSchema = z.object({
  consentType: z.string().min(1, "Consent type is required"),
  consentText: z.string().min(50, "Consent text must be provided"),
  agreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to proceed" }),
  }),
});

// Type exports
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type DisputeFormData = z.infer<typeof disputeSchema>;
export type CreditReportImportData = z.infer<typeof creditReportImportSchema>;
export type TradelineData = z.infer<typeof tradelineSchema>;
export type FundingProjectionData = z.infer<typeof fundingProjectionSchema>;
export type WealthPlanData = z.infer<typeof wealthPlanSchema>;
export type ActionData = z.infer<typeof actionSchema>;
export type ConsentData = z.infer<typeof consentSchema>;
