import { Box, InlineStack, BlockStack, Text, Button, Icon } from "@shopify/polaris";
import type { CartActivityItem } from "../../types";

interface ActivityItemProps {
  activity: CartActivityItem;
  onViewOrder?: () => void;
}

/**
 * ActivityItem component for displaying individual cart activity entries
 * @param activity - Cart activity data to display
 * @param onViewOrder - Optional callback for viewing order details
 */
export function ActivityItem({ activity, onViewOrder }: ActivityItemProps) {
  return (
    <Box padding="400">
      <InlineStack align="space-between" blockAlign="start">
        <InlineStack gap="400" blockAlign="center" align="start">
        <div style={{ width: '6px', height: '6px', backgroundColor: 'white/80', borderRadius: '50%' }} />
          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {activity.action}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              Cart value: {activity.cartValue} ({activity.itemCount} items) - Item: {activity.itemValue}
            </Text>
          </BlockStack>
        </InlineStack>
        <InlineStack gap="400" blockAlign="center" align="end">
          <Button variant="monochromePlain" size="slim" onClick={onViewOrder}>
            View Order
          </Button>
          <Text as="span" variant="bodySm" tone="subdued">{activity.timestamp}</Text>
        </InlineStack>
      </InlineStack>
    </Box>
  );
} 