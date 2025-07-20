import { BlockStack, InlineStack, Text } from "@shopify/polaris";

interface FeatureListProps {
  features: string[];
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <BlockStack gap="150">
      <Text as="p" variant="bodySm" fontWeight="medium">
        Features
      </Text>
      <BlockStack gap="150">
        {features.map((feature, index) => (
          <InlineStack key={index} gap="200" blockAlign="center">
            <div style={{ width: '3px', height: '3px', backgroundColor: '#000', borderRadius: '50%' }} />
            <Text as="p" variant="bodySm">
              {feature}
            </Text>
          </InlineStack>
        ))}
      </BlockStack>
    </BlockStack>
  );
}