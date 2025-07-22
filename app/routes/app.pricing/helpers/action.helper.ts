import { completeOnboardingStep } from "../../../server/installation/installation.service";
import { upsertSubscription } from "../../../server/subscription/subscription.repository";
import { createUsageBasedSubscription } from "../services/subscription.service";

export async function handlePlanSelection(selectedPlan: string, shop: string) {
  // Update subscription in database
  await upsertSubscription(shop, {
    planName: selectedPlan.toUpperCase(),
    status: "TRIAL",
    billingCycle: "MONTHLY",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  // Complete onboarding step
  await completeOnboardingStep(shop, "SHOW_PLAN");
}

export async function createShopifySubscription(request: Request, selectedPlan: string) {
  const result = await createUsageBasedSubscription(request, selectedPlan);
  
  if (!result.confirmationUrl) {
    throw new Error("No confirmation URL received");
  }
  
  return result.confirmationUrl;
} 