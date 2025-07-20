import { BlockStack, Text, Box } from "@shopify/polaris";

export function VideoHeader() {
  return (
    <Box paddingBlockStart="400">
      <BlockStack gap="400" align="center">
        <Text as="h1" variant="heading2xl" alignment="center">
          See UpCart in Action
        </Text>
        <Text as="p" alignment="center" tone="subdued" variant="bodyLg">
          Watch how easy it is to set up and use UpCart to boost your sales
        </Text>
      </BlockStack>
    </Box>
  );
}