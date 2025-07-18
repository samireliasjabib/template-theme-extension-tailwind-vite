import { Card, Box, BlockStack, InlineStack, Text, Button, Icon } from "@shopify/polaris";
import { GlobeIcon } from "@shopify/polaris-icons";

interface CartDrawerSettingsProps {
  onCustomize?: () => void;
}

/**
 * CartDrawerSettings component for configuration options
 * @param onCustomize - Optional callback for customize drawer action
 */
export function CartDrawerSettings({ onCustomize }: CartDrawerSettingsProps) {
  return (
    <Card>
      <Box padding="400" borderRadius="300">
        <BlockStack gap="400" align="center">
          <InlineStack gap="300" blockAlign="center">
            <Box>
              <Icon source={GlobeIcon} tone="base" />
            </Box>
            <Text as="h3" variant="headingMd">
              Cart Drawer Settings
            </Text>
          </InlineStack>
          
          <Text as="p" variant="bodyMd" tone="subdued">
            Configure cart drawer appearance and behavior settings.
          </Text>
          
          <Box paddingBlockStart="800">
            <Button fullWidth variant="primary" onClick={onCustomize}>
              Customize Drawer
            </Button>
          </Box>
        </BlockStack>
      </Box>
    </Card>
  );
} 