import { Banner, Text } from "@shopify/polaris";
import type { ActionData } from "../../types";

interface ActionBannerProps {
  actionData: ActionData | undefined;
}

export function ActionBanner({ actionData }: ActionBannerProps) {
  if (!actionData) return null;

  return (
    <Banner tone={actionData.success ? "success" : "critical"}>
      <Text as="p" variant="bodySm">
        {actionData.message}
      </Text>
    </Banner>
  );
}