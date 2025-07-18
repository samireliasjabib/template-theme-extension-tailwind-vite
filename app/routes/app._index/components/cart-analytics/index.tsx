import { Card, Box, BlockStack, InlineStack, Text, Button, Icon } from "@shopify/polaris";
import { ChartVerticalIcon } from "@shopify/polaris-icons";

interface CartAnalyticsProps {
  onViewAnalytics?: () => void;
}

/**
 * CartAnalytics component for analytics overview and access
 * @param onViewAnalytics - Optional callback for viewing detailed analytics
 */
export function CartAnalytics({ onViewAnalytics }: CartAnalyticsProps) {
  return (
    <Card>
      <Box padding="400" borderRadius="300">
        <BlockStack gap="400" inlineAlign="stretch">
          <InlineStack gap="300" blockAlign="center">
            <Box>
              <Icon source={ChartVerticalIcon} tone="success" />
            </Box>
            <Text as="h3" variant="headingMd">
              Cart Analytics
            </Text>
          </InlineStack>
          
          <Text as="p" variant="bodyMd" tone="subdued">
            Monitor cart performance and conversion rates in real-time.
          </Text>
          
          <Box paddingBlockStart="800">
            <Button fullWidth variant="primary" onClick={onViewAnalytics}>
              View Analytics
            </Button>
          </Box>
        </BlockStack>
      </Box>
    </Card>
  );
} 