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
import RecommendedFeaturesSlider from "../../components/RecommendedFeaturesSlider";

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
      <TitleBar title="Cart Drawer Analytics" />
      <BlockStack gap="500">
        {/* Cart Drawer Performance */}
        <Card>
          <BlockStack gap="500">
            {/* Header */}
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="400" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Cart Drawer Performance
                </Text>
                <Badge tone="info" size="large">Pro Plan</Badge>
              </InlineStack>
              
              <InlineStack gap="400" blockAlign="center">
                <Text as="span" variant="bodyMd" tone="subdued">
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
                  $8,420
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Revenue from cart drawer this month
                </Text>
              </BlockStack>
              
              <Box
                background="bg-fill-secondary"
                padding="400"
                borderRadius="300"
              >
                <Text as="span" variant="bodyMd" fontWeight="semibold" tone="success">
                  68% conversion rate
                </Text>
              </Box>
            </InlineStack>

            {/* Quick Stats - Cart-specific metrics */}
            <InlineStack gap="600" align="start">
              <Box background="bg-surface-success-subdued" padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      2.4 min
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Avg. Time in Cart
                    </Text>
                  </BlockStack>
                  <Badge tone="success" size="small">↗ Fast</Badge>
                </InlineStack>
              </Box>
              
              <Box padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      +23%
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Cart Abandonment ↓
                    </Text>
                  </BlockStack>
                  <Badge tone="success" size="small">↗ +23%</Badge>
                </InlineStack>
              </Box>
              
              <Box padding="400" borderRadius="300" minWidth="200px">
                <InlineStack gap="300" blockAlign="center">
                  <BlockStack gap="100" align="center">
                    <Text as="span" variant="bodyLg" fontWeight="semibold" tone="base">
                      3.2
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Items per Cart
                    </Text>
                  </BlockStack>
                  <Badge tone="attention" size="small">+0.4</Badge>
                </InlineStack>
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Bottom Section - Cards Grid */}
        <Layout>
          <Layout.Section>
            {/* Cart Activity Log */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    Cart Activity
                  </Text>
                  <Badge tone="success">Live</Badge>
                </InlineStack>
                
                <BlockStack gap="300">
                  {/* Cart Activity Item 1 */}
                  <Box padding="300" borderRadius="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-base"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            iPhone 15 Pro Max added
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cart value: $1,199.00 (3 items) - Item: $999.00
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">2:45 PM</Text>
                    </InlineStack>
                  </Box>

                  {/* Cart Activity Item 2 */}
                  <Box padding="300" borderRadius="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-base"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            MacBook Air M2 added
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cart value: $1,655.00 (4 items) - Item: $456.00
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text as="span" variant="bodySm" tone="subdued">2:38 PM</Text>
                    </InlineStack>
                  </Box>

                  {/* Cart Activity Item 3 */}
                  <Box padding="300" borderRadius="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-base"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            AirPods Pro removed
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cart value: $1,210.00 (3 items) - Item: -$245.00
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">2:31 PM</Text>
                    </InlineStack>
                  </Box>

                  {/* Cart Activity Item 4 */}
                  <Box padding="300" borderRadius="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-base"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            iPhone case added
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cart value: $1,255.00 (4 items) - Item: $45.00
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">2:18 PM</Text>
                    </InlineStack>
                  </Box>

                  {/* Cart Activity Item 5 */}
                  <Box padding="300" borderRadius="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Box 
                          background="bg-surface-base"
                          padding="100"
                          borderRadius="100"
                          minWidth="8px"
                          minHeight="8px"
                        />
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            Samsung Galaxy S24 added
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cart value: $1,299.00 (2 items) - Item: $1,199.00
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">1:45 PM</Text>
                    </InlineStack>
                  </Box>

                  {/* View All Button */}
                  <Button variant="plain" fullWidth>
                    View All Cart Activity
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* Cart Drawer Settings */}
              <Card>
                <Box background="bg-surface-brand-subdued" padding="400" borderRadius="300">
                  <BlockStack gap="400">
                    <InlineStack gap="300" blockAlign="center">
                      <Box>
                        <Icon source={GlobeIcon} tone="base" />
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Cart Drawer Settings
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Configure cart drawer appearance, behavior, and optimization settings.
                    </Text>
                    
                    <BlockStack gap="300">
                      <Button fullWidth variant="primary">
                        Customize Drawer
                      </Button>
                      
                      <Button fullWidth variant="secondary">
                        A/B Testing
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Box>
              </Card>

              {/* Cart Analytics */}
              <Card>
                <Box background="bg-surface-success-subdued" padding="400" borderRadius="300">
                  <BlockStack gap="400">
                    <InlineStack gap="300" blockAlign="center">
                      <Box>
                        <Icon source={ChartVerticalIcon} tone="success" />
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Cart Analytics
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Monitor cart performance, conversion rates, and user behavior patterns.
                    </Text>
                    
                    <InlineStack gap="200">
                      <Badge tone="success">Active</Badge>
                      <Badge>Real-time</Badge>
                    </InlineStack>
                    
                    <Button fullWidth>
                      View Analytics
                    </Button>
                  </BlockStack>
                </Box>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
        
        {/* Removed RecommendedFeaturesSlider */}
      </BlockStack>
    </Page>
  );
}