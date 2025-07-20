import { Box } from "@shopify/polaris";
import type { Plan } from "../../types";
import { PricingCard } from "../pricing-card";

interface PricingGridProps {
  plans: Plan[];
}

export function PricingGrid({ plans }: PricingGridProps) {
  return (
    <Box>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        alignItems: 'stretch'
      }}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </Box>
  );
}