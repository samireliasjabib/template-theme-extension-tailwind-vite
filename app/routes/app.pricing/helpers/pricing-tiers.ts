// Types for clarity
export interface PricingTier {
  name: string;
  basePrice: number;
  usageTerms: string;
  cappedAmount: number;
  description: string;
}

export function getPricingTier(planId: string): PricingTier {
  const pricingTiers: Record<string, PricingTier> = {
    growth: {
      name: "UpCart Growth Plan - Combined Pricing",
      basePrice: 9.99,
      usageTerms: "$0.10 per order after first 100 orders",
      cappedAmount: 129.99,
      description: "Base $9.99/month + $0.10 per order after 100 orders"
    },
    enterprise: {
      name: "UpCart Enterprise Plan",
      basePrice: 299.00,
      usageTerms: "Unlimited orders included",
      cappedAmount: 299.00,
      description: "Fixed $299.00/month - unlimited orders"
    }
  };
  return pricingTiers[planId];
} 
      