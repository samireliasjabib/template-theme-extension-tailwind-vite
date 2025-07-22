import type { PricingTier } from "./pricing-tiers";

type LineItem = {
  plan: {
    appRecurringPricingDetails?: {
      price: {
        amount: number;
        currencyCode: string;
      };
      interval: string;
    };
    appUsagePricingDetails?: {
      terms: string;
      cappedAmount: {
        amount: number;
        currencyCode: string;
      };
    };
  };
};

export function buildSubscriptionConfig(plan: PricingTier, shop: string, returnUrl: string) {
  const lineItems: LineItem[] = [
    {
      plan: {
        appRecurringPricingDetails: {
          price: {
            amount: plan.basePrice,
            currencyCode: "USD"
          },
          interval: "EVERY_30_DAYS"
        }
      }
    }
  ];

  // Add usage-based pricing only for combined plans
  if (plan.name === "combined") {
    lineItems.push({
      plan: {
        appUsagePricingDetails: {
          terms: plan.usageTerms,
          cappedAmount: {
            amount: plan.cappedAmount - plan.basePrice,
            currencyCode: "USD"
          }
        }
      }
    });
  }

  const isTest = ['testing-store-samir.myshopify.com'].includes(shop);

  return {
    name: plan.name,
    returnUrl,
    lineItems,
    test: isTest  // ✅ Use 'test' not 'isTest'
  };
} 