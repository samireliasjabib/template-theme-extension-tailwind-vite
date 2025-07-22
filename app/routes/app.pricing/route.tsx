import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { authenticate } from "../../server/shopify.server";
import { completeOnboardingStep } from "../../server/installation/installation.service";
import { upsertSubscription } from "../../server/subscription/subscription.repository";
import { Layout, BlockStack } from "@shopify/polaris";
import { PricingHeader, PricingBanner, ActionBanner, PricingGrid } from "./components";
import { PLANS } from "./constants";
import type { ActionData, LoaderData } from "./types";
import { useEffect } from "react";
import { createUsageBasedSubscription } from "./services/subscription.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const isOnboarding = url.searchParams.get("onboarding") === "true";
  
  return { isOnboarding };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, redirect: shopifyRedirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = formData.get("plan") as string;

  if (!selectedPlan) {
    return { success: false, message: "No plan selected" };
  }

  try {
    // Update subscription in your database (optional, for your own tracking)
    await upsertSubscription(session.shop, {
      planName: selectedPlan.toUpperCase(),
      status: "TRIAL",
      billingCycle: "MONTHLY",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    await completeOnboardingStep(session.shop, "SHOW_PLAN");

    // Create Shopify usage-based subscription
    const result = await createUsageBasedSubscription(request, selectedPlan);

    if (result.confirmationUrl) {
      console.log("🔗 Redirecting to Shopify billing:", result.confirmationUrl);
      // Use Shopify's redirect method for embedded apps
      return shopifyRedirect(result.confirmationUrl);
    } else {
      throw new Error("No confirmation URL received");
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create subscription"
    };
  }
};

export default function Pricing() {
  const { isOnboarding } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success === false) {
      console.error("Plan selection failed:", actionData.message);
    }
  }, [actionData]);

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
