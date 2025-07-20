import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useSearchParams, useLoaderData } from "@remix-run/react";
import { authenticate } from "../../server/shopify.server";
import { completeOnboardingStep } from "../../server/installation/installation.service";
import { upsertSubscription } from "../../server/subscription/subscription.repository";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  InlineStack,
  BlockStack,
  Banner,
  Box,
  Icon,
} from "@shopify/polaris";
import {
  CheckIcon,
  InfoIcon,
} from "@shopify/polaris-icons";

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
  const { isOnboarding } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const plans = [
    {
      id: "growth",
      name: "Growth plan",
      price: "Starting from $29.99/month",
      priceDescription: "Charges increase based on store orders up to a maximum of $199.99/month.",
      features: [
        "High converting cart",
        "Customizable design", 
        "Countdown and announcements",
        "Motivator bar for free shipping and discounts",
        "Upsells and add-ons",
        "Discount codes",
        "Notes",
        "Recommended for most stores"
      ],
      isPopular: true,
      buttonText: "Start 14-day free trial",
      buttonVariant: "primary" as const,
    },
    {
      id: "enterprise", 
      name: "Enterprise plan",
      price: "Fixed price of $299.00/month",
      priceDescription: "Charges do not scale with orders. This should only be considered by larger stores.",
      features: [
        "High converting cart",
        "Customizable design",
        "Countdown and announcements", 
        "Motivator bar for free shipping and discounts",
        "Upsells and add-ons",
        "Discount codes",
        "Notes",
        "Priority support in-app and via email"
      ],
      isPopular: false,
      buttonText: "Start 14-day free trial",
      buttonVariant: "secondary" as const,
    }
  ];

  return (
    <Page title={isOnboarding ? "Welcome to UpCart" : "Choose Your Plan"} subtitle="Step 1 of 3" >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Header Section */}
      

            {/* Information Banner */}
            <Banner tone="info" icon={InfoIcon}>
              <Text as="p" variant="bodySm">
                To get started, you must select a pricing plan. All plans include a 14-day free trial and are shown in USD. Uninstalling within the first 14 days avoids all charges.
              </Text>
            </Banner>

            {/* Action Result */}
            {actionData && (
              <Banner tone={actionData.success ? "success" : "critical"}>
                <Text as="p" variant="bodySm">
                  {actionData.message}
                </Text>
              </Banner>
            )}

            {/* Pricing Cards */}
            <Box paddingBlockEnd="600">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                alignItems: 'stretch'
              }}>
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <Box padding="400">
                      <BlockStack gap="400">
                        {/* Plan Header */}
                        <BlockStack gap="200">
                          <InlineStack gap="200" align="space-between">
                            <Text as="h3" variant="headingMd" fontWeight="bold">
                              {plan.name}
                            </Text>
                            {plan.isPopular && (
                              <Badge tone="success">Most popular</Badge>
                            )}
                          </InlineStack>
                        </BlockStack>

                        {/* Pricing */}
                        <BlockStack gap="150">
                          <Text as="p" variant="bodySm" fontWeight="medium">
                            Pricing
                          </Text>
                          <Text as="p" variant="bodyMd" fontWeight="bold">
                            {plan.price}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {plan.priceDescription}
                          </Text>
                        </BlockStack>

                        {/* Features */}
                        <BlockStack gap="150">
                          <Text as="p" variant="bodySm" fontWeight="medium">
                            Features
                          </Text>
                          <BlockStack gap="150">
                            {plan.features.map((feature, index) => (
                              <InlineStack key={index} gap="200" blockAlign="center">
                                <BlockStack gap="200">
                                  <Icon source={CheckIcon} tone="base" />
                                </BlockStack>
                                <Text as="p" variant="bodySm">
                                  {feature}
                                </Text>
                              </InlineStack>
                            ))}
                          </BlockStack>
                        </BlockStack>

                        {/* CTA Button */}
                        <Form method="post">
                          <input type="hidden" name="plan" value={plan.id} />
                          <Button
                            variant={plan.buttonVariant}
                            size="medium"
                            fullWidth
                            submit
                          >
                            {plan.buttonText}
                          </Button>
                        </Form>
                      </BlockStack>
                    </Box>
                  </Card>
                ))}
              </div>
            </Box>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
