import { authenticate } from "../../../server/shopify.server";
import { getPricingTier } from "../helpers/pricing-tiers";
import { buildSubscriptionConfig } from "../helpers/subscription.helper";
import { APP_SUBSCRIPTION_CREATE_MUTATION } from "../helpers/graphql.helper";

export async function createUsageBasedSubscription(request: Request, planId: string) {
  const { admin, session } = await authenticate.admin(request);

  const plan = getPricingTier(planId);
  const shop = session.shop;
  const returnUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/?status=confirmed_plan`;

  const subscriptionConfig = buildSubscriptionConfig(plan, shop, returnUrl);

  console.log("[SUBSCRIPTION] Shop:", shop);
  console.log("[SUBSCRIPTION] Plan ID:", planId);
  console.log("[SUBSCRIPTION] Config:", JSON.stringify(subscriptionConfig, null, 2));

  const response = await admin.graphql(APP_SUBSCRIPTION_CREATE_MUTATION, {
    variables: {
        ...subscriptionConfig
    }
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