import { 
  Card, 
  BlockStack, 
  InlineStack, 
  Text, 
  Badge, 
  Box,
  Grid
} from "@shopify/polaris";
import { PeriodSelector } from "../period-selector";
import { MetricCard } from "../metric-card";
import type { CartDrawerPerformanceData, PeriodOption } from "../../types";

interface CartDrawerPerformanceProps {
  data: CartDrawerPerformanceData;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  periodOptions: PeriodOption[];
}

/**
 * CartDrawerPerformance component displays main performance metrics
 * @param data - Performance data including revenue, conversion rate, and metrics
 * @param selectedPeriod - Currently selected time period
 * @param onPeriodChange - Callback when period changes
 * @param periodOptions - Available period options
 */
export function CartDrawerPerformance({
  data,
  selectedPeriod,
  onPeriodChange,
  periodOptions
}: CartDrawerPerformanceProps) {
  return (
    <Card>
      <BlockStack gap="600">
        {/* Header */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 8, xl: 8 }}>
            <InlineStack gap="400" blockAlign="center">
              <Text as="h2" variant="headingLg">
                Cart Drawer Performance
              </Text>
              <Badge tone="info">Pro Plan</Badge>
            </InlineStack>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
            <BlockStack gap="300" inlineAlign="end">
              <Text as="span" variant="bodyMd" tone="subdued">
                Last updated: {data.lastUpdated}
              </Text>
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onPeriodChange={onPeriodChange}
                options={periodOptions}
              />
            </BlockStack>
          </Grid.Cell>
        </Grid>
        
        {/* Main Metrics */}
          <Card padding="400">
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 8, xl: 8 }}>
            <Box padding="400" >
              <BlockStack gap="300">
                <Text as="p" variant="heading3xl" tone="base">
                  {data.revenue}
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Revenue from cart drawer this month
                </Text>
              </BlockStack>
            </Box>
          </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
              <Box padding="400" >
              <BlockStack gap="200" inlineAlign="center">
                <Text as="span" variant="headingMd" fontWeight="bold">
                  {data.conversionRate}
                </Text>
                <Text as="span" variant="bodyMd" tone="subdued">
                  Conversion Rate
                </Text>
              </BlockStack>
            </Box>
          </Grid.Cell>
        </Grid>
        </Card>
        {/* Quick Stats - Cart-specific metrics */}
        <Grid>
          {data.metrics.map((metric, index) => (
            <Grid.Cell key={index} columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <MetricCard metric={metric} />
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Card>
  );
} 