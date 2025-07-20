import { z } from "zod";

// Onboarding steps enum
export const OnboardingStepEnum = z.enum([
  "SHOW_PLAN",
  "VIDEO_DEMO", 
  "GO_TO_DASHBOARD"
]);

export type OnboardingStep = z.infer<typeof OnboardingStepEnum>;

// Dashboard configuration step types (hardcoded like UpCart)
export const DashboardConfigStepTypeEnum = z.enum([
  "MATCH_BRAND_DESIGN",
  "ADD_UPSELLS", 
  "ADD_REWARDS",
  "ACTIVATE_CART_DRAWER"
]);

export type DashboardConfigStepType = z.infer<typeof DashboardConfigStepTypeEnum>;

// Onboarding progress schema
export const OnboardingProgressSchema = z.object({
  currentStep: OnboardingStepEnum,
  completedSteps: z.array(OnboardingStepEnum),
  isCompleted: z.boolean()
});

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;

// Dashboard config step schema
export const DashboardConfigStepSchema = z.object({
  stepType: DashboardConfigStepTypeEnum,
  stepTitle: z.string(),
  stepDescription: z.string().optional(),
  isCompleted: z.boolean(),
  order: z.number(),
  actionButtonText: z.string(),
  actionUrl: z.string().optional()
});

export type DashboardConfigStep = z.infer<typeof DashboardConfigStepSchema>; 