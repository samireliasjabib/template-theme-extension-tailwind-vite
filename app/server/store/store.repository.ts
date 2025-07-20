import prisma from "../db.server";

export async function upsertStore(domain: string) {
  return prisma.store.upsert({
    where: { shopifyDomain: domain },
    create: {
      shopifyDomain: domain,
      name: domain,
      cartDrawerEnabled: true,
      isFirstInstall: true,
      onboardingCompleted: false,
      onboardingSteps: "[]", // Empty JSON array
      currentOnboardingStep: "welcome",
    },
    update: { 
      lastActiveAt: new Date(),
      // If store exists, mark as reinstalled
      isFirstInstall: false,
      reinstalledAt: new Date(),
      // Reset onboarding progress
      onboardingCompleted: false,
      onboardingSteps: "[]",
      currentOnboardingStep: "welcome",
    },
  });
} 


