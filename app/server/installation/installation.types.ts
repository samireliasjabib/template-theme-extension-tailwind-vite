import { z } from "zod";

// Installation flow steps enum
export const InstallationStepEnum = z.enum([
  "WELCOME",
  "SHOW_PLAN", 
  "VIDEO_DEMO",
  "GO_TO_DASHBOARD",
  "COMPLETED"
]);

export type InstallationStep = z.infer<typeof InstallationStepEnum>;

// Installation status enum
export const InstallationStatusEnum = z.enum([
  "NOT_INSTALLED",
  "INSTALLING", 
  "INSTALLED",
  "UNINSTALLED",
  "ERROR"
]);

export type InstallationStatus = z.infer<typeof InstallationStatusEnum>;

// Installation flow schema
export const InstallationFlowSchema = z.object({
  currentStep: InstallationStepEnum,
  completedSteps: z.array(InstallationStepEnum),
  isCompleted: z.boolean(),
  isFirstInstall: z.boolean(),
  message: z.string()
});

export type InstallationFlow = z.infer<typeof InstallationFlowSchema>;

// Installation validation result schema
export const InstallationValidationSchema = z.object({
  requiresInstallation: z.boolean(),
  isFirstInstall: z.boolean(),
  shouldRedirect: z.boolean(),
  redirectPath: z.string(),
  message: z.string()
});

export type InstallationValidation = z.infer<typeof InstallationValidationSchema>; 