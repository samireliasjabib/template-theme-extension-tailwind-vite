import { Page } from "@shopify/polaris";
import { ReactNode } from "react";

interface PricingHeaderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PricingHeader({ title, subtitle, children }: PricingHeaderProps) {
  return (
    <Page title={title} subtitle={subtitle} narrowWidth>
      {children}
    </Page>
  );
}