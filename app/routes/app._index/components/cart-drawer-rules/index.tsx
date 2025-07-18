import { Card, Box, BlockStack, InlineStack, Text, Button, Icon } from "@shopify/polaris";
import { CartIcon } from "@shopify/polaris-icons";

interface CartDrawerRulesProps {
  onManageRules?: () => void;
}

/**
 * CartDrawerRules component for managing cart drawer rules and conditions
 * @param onManageRules - Optional callback for managing rules action
 */
export function CartDrawerRules({ onManageRules }: CartDrawerRulesProps) {
  return (
    <Card>
        <Box padding="400" borderRadius="300">
        <BlockStack gap="400" inlineAlign="stretch">
          <InlineStack gap="300" blockAlign="center">
            <Box>
              <Icon source={CartIcon} tone="base" />
            </Box>
            <Text as="h3" variant="headingMd">
              Cart Drawer Rules
            </Text>
          </InlineStack>
          
          <Text as="p" variant="bodyMd" tone="subdued">
            Set up rules for cart drawer behavior and conditions.
          </Text>
          
          <Box paddingBlockStart="800">
            <Button fullWidth variant="primary" onClick={onManageRules}>
              Manage Rules
            </Button>
          </Box>
        </BlockStack>
      </Box>
    </Card>
  );
}