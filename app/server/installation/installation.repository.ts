import prisma from "../db.server";

export async function setUninstalled(storeDomain: string) {
  return prisma.installationStatus.upsert({
    where: { storeId: storeDomain },
    create: {
      storeId: storeDomain,
      status: "UNINSTALLED",
      uninstalledAt: new Date(),
      progress: 100,
    },
    update: { status: "UNINSTALLED", uninstalledAt: new Date(), progress: 100 },
  });
}

export async function getStoreByDomain(shopDomain: string) {
  return prisma.store.findUnique({
    where: { shopifyDomain: shopDomain },
    select: {
      id: true,
      shopifyDomain: true,
      isFirstInstall: true,
      onboardingCompleted: true,
      onboardingSteps: true,
      currentOnboardingStep: true,
      reinstalledAt: true,
    }
  });
}

export async function updateOnboardingStep(
  shopDomain: string, 
  stepId: string, 
  completedSteps: string[]
) {
  return prisma.store.update({
    where: { shopifyDomain: shopDomain },
    data: {
      currentOnboardingStep: stepId,
      onboardingSteps: JSON.stringify(completedSteps),
      onboardingCompleted: completedSteps.length >= 5, // Assuming 5 total steps
    }
  });
} 