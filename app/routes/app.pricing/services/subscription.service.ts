import { authenticate } from "../../../server/shopify.server";

export async function createUsageBasedSubscription(request: Request, planId: string) {
  const { admin, session } = await authenticate.admin(request);
  
  // Pricing tiers as specified by the user
  const pricingTiers = {
    growth: {
      name: "UpCart Growth Plan - Usage Based",
      terms: "Usage-based pricing: $19.99 for 0-200 orders, $39.99 for 201-1000 orders, $69.99 for 1001-2000 orders, $89.99 for 2001-3000 orders, $109.99 for 3001-5000 orders, $129.99 for 5000+ orders",
      cappedAmount: 129.99
    },
    enterprise: {
      name: "UpCart Enterprise Plan",
      terms: "Fixed pricing: $299.00/month",
      cappedAmount: 299.00
    }
  };

  const plan = pricingTiers[planId as keyof typeof pricingTiers];
  const shop = session.shop;
  const returnUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/?status=confirmed_plan`;

  let subscriptionConfig;
  if (planId === "growth") {
    subscriptionConfig = {
      name: plan.name,
      returnUrl,
      lineItems: [
        {
          plan: {
            appUsagePricingDetails: {
              terms: plan.terms,
              cappedAmount: {
                amount: plan.cappedAmount,
                currencyCode: "USD"
              }
            }
          }
        }
      ]
    };
  } else {
    subscriptionConfig = {
      name: plan.name,
      returnUrl,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: plan.cappedAmount,
                currencyCode: "USD"
              },
              interval: "EVERY_30_DAYS"
            }
          }
        }
      ]
    };
  }

  console.log("[SUBSCRIPTION] Creating subscription for shop:", shop);
  console.log("[SUBSCRIPTION] Plan ID:", planId);
  console.log("[SUBSCRIPTION] Subscription config:", JSON.stringify(subscriptionConfig, null, 2));

  const response = await admin.graphql(`
    mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        lineItems: $lineItems
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
          lineItems {
            id
            plan {
              pricingDetails {
                __typename
              }
            }
          }
        }
      }
    }
  `, {
    variables: subscriptionConfig
  });

  const result = await response.json();

  console.log("[SUBSCRIPTION] Shopify GraphQL response:", JSON.stringify(result, null, 2));

  if (result.data?.appSubscriptionCreate?.userErrors?.length > 0) {
    const error = result.data.appSubscriptionCreate.userErrors[0];
    console.error("[SUBSCRIPTION] Shopify userErrors:", result.data.appSubscriptionCreate.userErrors);
    throw new Error(`${error.field}: ${error.message}`);
  }

  console.log("[SUBSCRIPTION] Confirmation URL:", result.data?.appSubscriptionCreate?.confirmationUrl);
  console.log("[SUBSCRIPTION] Subscription ID:", result.data?.appSubscriptionCreate?.appSubscription?.id);

  return result.data?.appSubscriptionCreate;
} 