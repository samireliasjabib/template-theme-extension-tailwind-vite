import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
  Box,
  Select,
} from "@shopify/polaris";
import {
  GlobeIcon,
  ChartVerticalIcon,
} from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  const periodOptions = [
    { label: 'This Month', value: 'month' },
    { label: 'This Week', value: 'week' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
  ];

  return (
    <Page>
      <TitleBar title="BundleAI Dashboard" />
      <BlockStack gap="500">
        {/* Monthly Bundle Impact - Enhanced with Plan and Filter */}
        <Card>
          <BlockStack gap="500">
            {/* Header with Title, Plan, and Filter */}
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="400" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Monthly Bundle Impact
                </Text>
                <Badge tone="info" size="large">Pro Plan</Badge>
              </InlineStack>
              
              <InlineStack gap="400" blockAlign="center">
                <Text variant="bodyMd" tone="subdued">
                  Last updated: Today, 2:45 PM
                </Text>
                <Box minWidth="150px">
                  <Select
                    label=""
                    options={periodOptions}
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                  />
                </Box>
              </InlineStack>
            </InlineStack>
            
            {/* Main Metrics */}
            <InlineStack gap="600" align="space-between" blockAlign="center">
              <BlockStack gap="200">
                <Text as="p" variant="heading3xl" tone="base">
                  $2,340
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Extra revenue this month
                </Text>
              </BlockStack>
              
              <Box
                background="bg-fill-secondary"
                padding="400"
                borderRadius="300"
              >
                <Text as="span" variant="bodyMd" fontWeight="semibold" tone="success">
                  +$12 Each order on average
                </Text>
              </Box>
            </InlineStack>

            {/* Quick Stats - ROI, AOV, Cost Plan */}
            <InlineStack gap="600" align="start">
              <Box background="bg-surface-success-subdued" padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      5,900%
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      ROI
                    </Text>
                  </BlockStack>
                  <Badge tone="success" size="small">↗ High</Badge>
                </InlineStack>
              </Box>
              
              <Box background="bg-surface-info-subdued" padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      +18%
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      AOV Increase
                    </Text>
                  </BlockStack>
                  <Badge tone="success" size="small">↗ +18%</Badge>
                </InlineStack>
              </Box>
              
              <Box background="bg-surface-warning-subdued" padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      $39
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Cost Plan
                    </Text>
                  </BlockStack>
                  <Badge tone="attention" size="small">+2%</Badge>
                </InlineStack>
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Bottom Section - Cards Grid */}
        <Layout>
          <Layout.Section>
            {/* Activity Log */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    Activity Log
                  </Text>
                  <Badge tone="success">Live</Badge>
                </InlineStack>
                
                <BlockStack gap="300">
                  {/* Activity Item 1 */}
                  <Box
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-success"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            iPhone 15 Pro Max bought from IA bundle generated on iPhone 15 Case
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            +24% added to total order ($89.50 extra)
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">2 min ago</Text>
                    </InlineStack>
                  </Box>

                  {/* Activity Item 2 */}
                  <Box
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-success"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            MacBook Air M2 bought from IA bundle generated on Magic Mouse
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            +18% added to total order ($156.20 extra)
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text as="span" variant="bodySm" tone="subdued">8 min ago</Text>
                    </InlineStack>
                  </Box>

                  {/* Activity Item 3 */}
                  <Box
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-success"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            AirPods Pro bought from IA bundle generated on iPhone 14 Pro
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            +31% added to total order ($45.75 extra)
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">15 min ago</Text>
                    </InlineStack>
                  </Box>

                  {/* Activity Item 4 */}
                  <Box
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-success"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            Nike Air Jordan bought from IA bundle generated on Nike Socks Pack
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            +22% added to total order ($67.80 extra)
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">28 min ago</Text>
                    </InlineStack>
                  </Box>

                  {/* Activity Item 5 */}
                  <Box
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-success"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            Samsung Galaxy S24 bought from IA bundle generated on Galaxy Watch 6
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            +19% added to total order ($123.40 extra)
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">1 hour ago</Text>
                    </InlineStack>
                  </Box>

                  {/* View All Button */}
                  <Button variant="plain" fullWidth>
                    View All Activity
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* White Globe Installation */}
              <Card>
                <Box background="bg-surface-brand-subdued" padding="400" borderRadius="300">
                  <BlockStack gap="400">
                    <InlineStack gap="300" blockAlign="center">
                      <Box>
                        <Icon source={GlobeIcon} tone="base" />
                      </Box>
                      <Text as="h3" variant="headingMd">
                        White Globe Installation
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Get our premium analytics solution installed on your store for advanced revenue tracking and insights.
                    </Text>
                    
                    <BlockStack gap="300">
                      <Button fullWidth variant="primary">
                        Installation Assistant
                      </Button>
                      
                      <Button fullWidth variant="secondary">
                        Manual Installation
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Box>
              </Card>

              {/* Bundle Rules */}
              <Card>
                <Box background="bg-surface-success-subdued" padding="400" borderRadius="300">
                  <BlockStack gap="400">
                    <InlineStack gap="300" blockAlign="center">
                      <Box>
                        <Icon source={ChartVerticalIcon} tone="success" />
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Bundle Rules
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Configure bundle logic, discount rules, and automated optimization settings.
                    </Text>
                    
                    <InlineStack gap="200">
                      <Badge tone="success">Active</Badge>
                      <Badge>Auto-optimize</Badge>
                    </InlineStack>
                    
                    <Button fullWidth>
                      Configure Rules
                    </Button>
                  </BlockStack>
                </Box>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}