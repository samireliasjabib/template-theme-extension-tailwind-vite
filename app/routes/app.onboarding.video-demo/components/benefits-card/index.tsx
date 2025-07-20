import { Card, BlockStack, Text } from "@shopify/polaris";

export function BenefitsCard() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          What You'll Learn
        </Text>
        
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            • How to customize your cart drawer design
          </Text>
          <Text as="p" variant="bodyMd">
            • Setting up AI-powered product recommendations
          </Text>
          <Text as="p" variant="bodyMd">
            • Adding upsells and cross-sells to increase AOV
          </Text>
          <Text as="p" variant="bodyMd">
            • Understanding your analytics and performance
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}