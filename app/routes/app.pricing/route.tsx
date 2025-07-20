import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { authenticate } from "../../server/shopify.server";
import { completeOnboardingStep } from "../../server/installation/installation.service";
import { upsertSubscription } from "../../server/subscription/subscription.repository";
import { Layout, BlockStack } from "@shopify/polaris";
import { PricingHeader, PricingBanner, ActionBanner, PricingGrid } from "./components";
import { PLANS } from "./constants";
import type { ActionData, LoaderData } from "./types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const isOnboarding = url.searchParams.get("onboarding") === "true";
  
  return { isOnboarding };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = formData.get("plan") as string;
  
  if (!selectedPlan) {
    return { success: false, message: "No plan selected" };
  }

  try {
    // Update subscription in database
    await upsertSubscription(session.shop, {
      planName: selectedPlan.toUpperCase(),
      status: "TRIAL",
      billingCycle: "MONTHLY",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    // Complete the SHOW_PLAN onboarding step
    await completeOnboardingStep(session.shop, "SHOW_PLAN");

    console.log(`✅ Plan ${selectedPlan} selected for ${session.shop}`);
    
    return { 
      success: true, 
      message: `${selectedPlan} plan selected successfully!`,
      redirectTo: "/app/onboarding/video-demo"
    };
  } catch (error) {
    console.error("Error selecting plan:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to select plan" 
    };
  }
};

export default function Pricing() {
  const { isOnboarding } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <PricingHeader 
      title={isOnboarding ? "Welcome to UpCart" : "Choose Your Plan"} 
      subtitle="Step 1 of 3"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            <PricingBanner />
            <ActionBanner actionData={actionData} />
            <PricingGrid plans={PLANS} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </PricingHeader>
  );
}
