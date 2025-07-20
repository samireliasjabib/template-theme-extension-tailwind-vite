/**
 * Dashboard configuration service for setup guide
 */
import { getConfigSteps, getNextConfigStep, completeConfigStep } from "./dashboard-config.repository";

export interface SetupGuideData {
  totalSteps: number;
  completedSteps: number;
  progress: number;
  steps: Array<{
    id: string;
    stepType: string;
    title: string;
    description: string;
    isCompleted: boolean;
    order: number;
    actionButtonText: string;
    actionUrl?: string;
    badge?: string;
  }>;
}

export async function getSetupGuide(storeId: string): Promise<SetupGuideData> {
  const steps = await getConfigSteps(storeId);
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const stepsWithBadges = steps.map(step => ({
    id: step.id,
    stepType: step.stepType,
    title: step.stepTitle,
    description: step.stepDescription || "",
    isCompleted: step.isCompleted,
    order: step.order,
    actionButtonText: step.actionButtonText,
    actionUrl: step.actionUrl || undefined,
    badge: step.isCompleted ? "Completed" : 
           step.order === 1 ? "Recommended" : undefined
  }));

  return {
    totalSteps,
    completedSteps,
    progress,
    steps: stepsWithBadges
  };
}

export async function markStepAsCompleted(stepId: string) {
  return completeConfigStep(stepId);
}

export async function getNextSetupStep(storeId: string) {
  return getNextConfigStep(storeId);
} 