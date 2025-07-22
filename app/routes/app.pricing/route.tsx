import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { authenticate } from "../../server/shopify.server";
import { Layout, BlockStack } from "@shopify/polaris";
import { PricingHeader, PricingBanner, ActionBanner, PricingGrid } from "./components";
import { PLANS } from "./constants";
import type { ActionData, LoaderData } from "./types";
import { handlePlanSelection, createShopifySubscription } from "./helpers/action.helper";

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
    // Handle plan selection and database updates
    await handlePlanSelection(selectedPlan, session.shop);
    
    // Create Shopify subscription and get confirmation URL
    const confirmationUrl = await createShopifySubscription(request, selectedPlan);
    
    console.log("🔗 Redirecting to Shopify billing:", confirmationUrl);
    return shopifyRedirect(confirmationUrl);
    
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
