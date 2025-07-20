import { Banner, Text } from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";

export function PricingBanner() {
  return (
    <Banner tone="info" icon={InfoIcon}>
      <Text as="p" variant="bodySm">
        To get started, you must select a pricing plan. All plans include a 14-day free trial and are shown in USD. Uninstalling within the first 14 days avoids all charges.
      </Text>
    </Banner>
  );
}