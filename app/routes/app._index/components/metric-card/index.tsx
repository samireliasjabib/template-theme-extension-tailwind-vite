import { Box, BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";
import type { MetricData } from "../../types";

interface MetricCardProps {
  metric: MetricData;
}

/**
 * MetricCard component for displaying individual metrics
 * @param metric - Metric data to display including value, label, and optional badge
 */
export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Box 
      background="bg-surface-secondary" 
      padding="400" 
      borderRadius="300" 
      minWidth="200px"
    >
      <InlineStack gap="300" blockAlign="center">
        <BlockStack gap="100" align="center">
          <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
            {metric.value}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {metric.label}
          </Text>
        </BlockStack>
        {metric.badge && (
          <Badge tone={metric.badge.tone} size="small">
            {metric.badge.text}
          </Badge>
        )}
      </InlineStack>
    </Box>
  );
} 