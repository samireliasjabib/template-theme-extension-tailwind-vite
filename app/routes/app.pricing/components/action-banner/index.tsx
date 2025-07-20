import { Banner, Text } from "@shopify/polaris";
import type { ActionData } from "../../types";

interface ActionBannerProps {
  actionData: ActionData | undefined;
}

export function ActionBanner({ actionData }: ActionBannerProps) {
  if (!actionData || actionData.success) return null;

  return (
    <Banner tone="critical">
      <Text as="p" variant="bodySm">
        {actionData.message}
      </Text>
    </Banner>
  );
}