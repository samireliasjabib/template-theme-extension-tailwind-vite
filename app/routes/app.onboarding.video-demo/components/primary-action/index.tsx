import { Form } from "@remix-run/react";
import { Button, Box, InlineStack } from "@shopify/polaris";

export function PrimaryAction() {
  return (
    <Box paddingBlockEnd="400">
      <InlineStack gap="400" align="end">
        <Form method="post">
          <input type="hidden" name="action" value="continueToDashboard" />
          <Button 
            variant="primary" 
            submit
            size="large"
          >
            Continue to Dashboard →
          </Button>
        </Form>
      </InlineStack>
    </Box>
  );
}