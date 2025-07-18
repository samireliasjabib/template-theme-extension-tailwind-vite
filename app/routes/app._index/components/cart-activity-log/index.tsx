import { Card, BlockStack, InlineStack, Text, Badge, Button } from "@shopify/polaris";
import { ActivityItem } from "../activity-item";
import type { CartActivityData } from "../../types";

interface CartActivityLogProps {
  data?: CartActivityData; // Make optional
  onViewAll?: () => void;
}

export function CartActivityLog({ data, onViewAll }: CartActivityLogProps) {
  // Add null checking
  if (!data) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingLg">Cart Drawer Activity</Text>
          <Text as="span" tone="subdued">Loading...</Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <Text as="h2" variant="headingLg">
              Cart Drawer Activity
            </Text>
            <Badge tone={data.isLive ? "success" : "info"}>
              {data.isLive ? "Live" : "Offline"}
            </Badge>
          </InlineStack>
          <Button variant="secondary" onClick={onViewAll}>
            View All Drawer Activity
          </Button>
        </InlineStack>
        
        <BlockStack gap="300">
          {data.items?.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}

        </BlockStack>
      </BlockStack>
    </Card>
  );
} 