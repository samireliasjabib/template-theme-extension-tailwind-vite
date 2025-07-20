/**
 * Installation service for managing app installation and onboarding
 */
import type { Session } from "@shopify/shopify-app-remix/server";
import { upsertStore } from "../store/store.repository";
import { ensureTrialSubscription, cancelSubscriptions } from "../subscription/subscription.repository";
import { setUninstalled, getStoreByDomain, updateOnboardingStep } from "./installation.repository";
import { createDefaultConfigSteps } from "../dashboard-config/dashboard-config.repository";
import { OnboardingStepEnum, type OnboardingStep } from "../dashboard-config/onboarding.types";

export async function getWelcomeMessage(shopDomain: string): Promise<{
  isFirstInstall: boolean;
  message: string;
  currentStep: string;
}> {
  const store = await getStoreByDomain(shopDomain);
  
  if (!store) {
    return {
      isFirstInstall: true,
      message: "Welcome! Let's get your cart drawer set up.",
      currentStep: "welcome"
    };
  }

  if (store.isFirstInstall) {
    return {
      isFirstInstall: true,
      message: "Welcome! Let's get your cart drawer set up.",
      currentStep: store.currentOnboardingStep || "welcome"
    };
  } else {
    return {
      isFirstInstall: false,
      message: "Welcome back! We're happy to have you here again.",
      currentStep: store.currentOnboardingStep || "welcome"
    };
  }
}

/* -------- Installation functions ---------------------------------------- */
export async function registerInstallation(session: Session) {
  const store = await upsertStore(session.shop);
  await ensureTrialSubscription(store.id);
  
  // Create default dashboard configuration steps
  await createDefaultConfigSteps(store.id);
  
  // Get onboarding info for welcome message
  const onboardingInfo = await getWelcomeMessage(session.shop);
  
  return {
    store,
    onboardingInfo
  };
}

export async function markUninstalled(shopDomain: string) {
  await setUninstalled(shopDomain);
  await cancelSubscriptions(shopDomain);
}

export async function completeOnboardingStep(
  shopDomain: string, 
  stepId: OnboardingStep
): Promise<void> {
  const store = await getStoreByDomain(shopDomain);
  if (!store) return;

  const currentSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) : [];
  const updatedSteps = [...new Set([...currentSteps, stepId])];
  
  await updateOnboardingStep(shopDomain, stepId, updatedSteps);
}

export async function getNextOnboardingStep(shopDomain: string): Promise<OnboardingStep | null> {
  const store = await getStoreByDomain(shopDomain);
  if (!store) return OnboardingStepEnum.enum.SHOW_PLAN;

  const completedSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) : [];
  
  if (completedSteps.length === 0) return OnboardingStepEnum.enum.SHOW_PLAN;
  if (completedSteps.length === 1) return OnboardingStepEnum.enum.VIDEO_DEMO;
  if (completedSteps.length === 2) return OnboardingStepEnum.enum.GO_TO_DASHBOARD;
  
  return null; // All steps completed
} 