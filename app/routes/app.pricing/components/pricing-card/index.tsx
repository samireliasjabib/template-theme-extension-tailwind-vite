import { Card, Box, BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";
import type { Plan } from "../../types";
import { FeatureList } from "../feature-list";
import { PlanButton } from "../plan-button";

interface PricingCardProps {
  plan: Plan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card key={plan.id}>
      <Box>
        <BlockStack gap="400">
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

          <FeatureList features={plan.features} />

          <PlanButton plan={plan} />
        </BlockStack>
      </Box>
    </Card>
  );
}