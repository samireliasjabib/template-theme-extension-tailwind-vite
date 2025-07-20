import prisma from "../db.server";

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