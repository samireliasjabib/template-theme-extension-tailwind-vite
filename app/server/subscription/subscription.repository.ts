import prisma from "../db.server";

export async function upsertSubscription(
  shopDomain: string, 
  subscriptionData: {
    planName: string;
    status: string;
    billingCycle: string;
    trialEndsAt: Date;
    currentPeriodEnd: Date;
  }
) {
  // First get the store
  const store = await prisma.store.findUnique({
    where: { shopifyDomain: shopDomain }
  });

  if (!store) {
    throw new Error(`Store ${shopDomain} not found`);
  }

  // Upsert subscription
  return prisma.subscription.upsert({
    where: { storeId: store.id },
    create: {
      storeId: store.id,
      planName: subscriptionData.planName,
      status: subscriptionData.status,
      billingCycle: subscriptionData.billingCycle,
      trialEndsAt: subscriptionData.trialEndsAt,
      currentPeriodEnd: subscriptionData.currentPeriodEnd,
    },
    update: {
      planName: subscriptionData.planName,
      status: subscriptionData.status,
      billingCycle: subscriptionData.billingCycle,
      trialEndsAt: subscriptionData.trialEndsAt,
      currentPeriodEnd: subscriptionData.currentPeriodEnd,
    }
  });
}

export async function ensureTrialSubscription(storeId: string) {
  return prisma.subscription.upsert({
    where: { storeId },
    create: {
      storeId,
      planName: "BASIC",
      status: "TRIAL",
      billingCycle: "MONTHLY",
      currentPeriodEnd: new Date(), // placeholder
    },
    update: { updatedAt: new Date() },
  });
}

export async function cancelSubscriptions(storeDomain: string) {
  return prisma.subscription.updateMany({
    where: { store: { shopifyDomain: storeDomain } },
    data: { status: "CANCELLED", updatedAt: new Date() },
  });
} 