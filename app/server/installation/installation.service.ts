/**
 * Installation service for managing app installation and onboarding
 */
import type { Session } from "@shopify/shopify-app-remix/server";
import { upsertStore } from "../store/store.repository";
import { ensureTrialSubscription, cancelSubscriptions } from "../subscription/subscription.repository";
import { setUninstalled, getStoreByDomain, updateOnboardingStep } from "./installation.repository";
import { createDefaultConfigSteps } from "../dashboard-config/dashboard-config.repository";
import { 
  InstallationStepEnum, 
  type InstallationStep,
  InstallationFlowSchema,
  type InstallationFlow,
  InstallationValidationSchema,
  type InstallationValidation
} from "./installation.types";
import prisma from "../db.server";

export async function getWelcomeMessage(shopDomain: string): Promise<InstallationFlow> {
  const store = await getStoreByDomain(shopDomain);
  
  if (!store) {
    return InstallationFlowSchema.parse({
      currentStep: InstallationStepEnum.enum.WELCOME,
      completedSteps: [],
      isCompleted: false,
      isFirstInstall: true,
      message: "Welcome! Let's get your cart drawer set up."
    });
  }

  if (store.isFirstInstall) {
    const currentStep = store.currentOnboardingStep as InstallationStep || InstallationStepEnum.enum.WELCOME;
    const completedSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) as InstallationStep[] : [];
    
    return InstallationFlowSchema.parse({
      currentStep,
      completedSteps,
      isCompleted: store.onboardingCompleted,
      isFirstInstall: true,
      message: "Welcome! Let's get your cart drawer set up."
    });
  } else {
    const currentStep = store.currentOnboardingStep as InstallationStep || InstallationStepEnum.enum.GO_TO_DASHBOARD;
    const completedSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) as InstallationStep[] : [];
    
    return InstallationFlowSchema.parse({
      currentStep,
      completedSteps,
      isCompleted: store.onboardingCompleted,
      isFirstInstall: false,
      message: "Welcome back! We're happy to have you here again."
    });
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
  stepId: InstallationStep
): Promise<void> {
  const store = await getStoreByDomain(shopDomain);
  if (!store) return;

  const currentSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) as InstallationStep[] : [];
  const updatedSteps = [...new Set([...currentSteps, stepId])];
  
  await updateOnboardingStep(shopDomain, stepId, updatedSteps);
}

export async function getNextOnboardingStep(shopDomain: string): Promise<InstallationStep | null> {
  const store = await getStoreByDomain(shopDomain);
  if (!store) return InstallationStepEnum.enum.SHOW_PLAN;

  const completedSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) as InstallationStep[] : [];
  
  if (completedSteps.length === 0) return InstallationStepEnum.enum.SHOW_PLAN;
  if (completedSteps.length === 1) return InstallationStepEnum.enum.VIDEO_DEMO;
  if (completedSteps.length === 2) return InstallationStepEnum.enum.GO_TO_DASHBOARD;
  
  return null; // All steps completed
}

export async function getCurrentOnboardingStep(shopDomain: string): Promise<InstallationStep> {
  const store = await getStoreByDomain(shopDomain);
  if (!store) return InstallationStepEnum.enum.WELCOME;

  const currentStep = store.currentOnboardingStep as InstallationStep;
  if (currentStep && Object.values(InstallationStepEnum.enum).includes(currentStep)) {
    return currentStep;
  }

  // Fallback logic based on completed steps
  const completedSteps = store.onboardingSteps ? JSON.parse(store.onboardingSteps) as InstallationStep[] : [];
  
  if (completedSteps.length === 0) return InstallationStepEnum.enum.SHOW_PLAN;
  if (completedSteps.length === 1) return InstallationStepEnum.enum.VIDEO_DEMO;
  if (completedSteps.length >= 2) return InstallationStepEnum.enum.GO_TO_DASHBOARD;
  
  return InstallationStepEnum.enum.WELCOME;
} 

/**
 * Validates if store requires installation and handles the complete flow
 */
export async function validateAndHandleInstallation(session: Session): Promise<InstallationValidation> {
  const shopDomain = session.shop;
  
  // Check if store exists and its installation status
  const store = await getStoreByDomain(shopDomain);
  
  if (!store) {
    // Store doesn't exist - needs installation
    console.log(` Installing app for ${shopDomain}...`);
    const { onboardingInfo } = await registerInstallation(session);
    
    return InstallationValidationSchema.parse({
      requiresInstallation: false, // Now installed
      isFirstInstall: true,
      shouldRedirect: true,
      redirectPath: "/pricing?onboarding=true",
      message: onboardingInfo.message
    });
  }
  
  // Store exists - check if it's a first install
  if (store.isFirstInstall) {
    console.log(`🎯 First install detected for ${shopDomain}`);
    return InstallationValidationSchema.parse({
      requiresInstallation: false,
      isFirstInstall: true,
      shouldRedirect: true,
      redirectPath: "/app/pricing?onboarding=true&firstInstall=true",
      message: "Welcome! Let's get your cart drawer set up."
    });
  }

  // Check current onboarding step
  const currentStep = await getCurrentOnboardingStep(shopDomain);
  
  if (currentStep === InstallationStepEnum.enum.VIDEO_DEMO) {
    console.log(`🎥 Redirecting to video demo for ${shopDomain}`);
    return InstallationValidationSchema.parse({
      requiresInstallation: false,
      isFirstInstall: false,
      shouldRedirect: true,
      redirectPath: "/app/onboarding/video-demo",
      message: "Let's show you how UpCart works!"
    });
  }
  
  // Store exists and is not first install - go to dashboard
  console.log(`✅ Store ${shopDomain} already installed, redirecting to dashboard`);
  return InstallationValidationSchema.parse({
    requiresInstallation: false,
    isFirstInstall: false,
    shouldRedirect: true,
    redirectPath: "/app",
    message: "Welcome back! We're happy to have you here again."
  });
} 

/**
 * Mock function to simulate completed installation for testing
 * Sets isFirstInstall to false and completes first onboarding step
 */
export async function mockCompletedInstallation(shopDomain: string) {
  const store = await getStoreByDomain(shopDomain);
  if (!store) {
    throw new Error(`Store ${shopDomain} not found`);
  }

  // Update store to simulate completed installation
  await prisma.store.update({
    where: { shopifyDomain: shopDomain },
    data: {
      isFirstInstall: false,
      onboardingCompleted: false,
      onboardingSteps: JSON.stringify(["SHOW_PLAN"]), // First step completed
      currentOnboardingStep: "VIDEO_DEMO", // Next step
    }
  });

  console.log(`✅ Mocked completed installation for ${shopDomain}`);
  return { success: true };
}

/**
 * Mock function to reset to first install for testing
 */
export async function mockFirstInstall(shopDomain: string) {
  const store = await getStoreByDomain(shopDomain);
  if (!store) {
    throw new Error(`Store ${shopDomain} not found`);
  }

  // Reset store to first install state
  await prisma.store.update({
    where: { shopifyDomain: shopDomain },
    data: {
      isFirstInstall: true,
      onboardingCompleted: false,
      onboardingSteps: JSON.stringify([]), // No steps completed
      currentOnboardingStep: "WELCOME",
    }
  });

  console.log(`✅ Mocked first install for ${shopDomain}`);
  return { success: true };
} 


