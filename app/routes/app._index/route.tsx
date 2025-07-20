import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  BlockStack,
  Grid,
  InlineStack,
  Layout,
  Page,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../server/shopify.server";

// Import atomic components and constants
import {
  CartDrawerPerformance,
  CartActivityLog,
  CartDrawerSettings,
  CartAnalytics,
  CartDrawerRules,
} from "./components";
import { PERIOD_OPTIONS, PERFORMANCE_DATA, ACTIVITY_DATA } from "./constants";

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

  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  // Handler for period change
  const handlePeriodChange = (value: string) => setSelectedPeriod(value);

  return (
    <Page>
      <TitleBar title="Cart Drawer Analytics" />
      <Layout>
        <Layout.Section variant="fullWidth">
        <CartDrawerPerformance
          data={PERFORMANCE_DATA}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          periodOptions={PERIOD_OPTIONS}
        />
        </Layout.Section>
        <Layout.Section variant="fullWidth">
          <CartActivityLog data={ACTIVITY_DATA} />
        </Layout.Section>
        <Layout.Section variant="fullWidth">
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
              <CartDrawerSettings />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs:6, sm: 6, md: 3, lg: 4, xl: 4 }}> 
              <CartAnalytics />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
              <CartDrawerRules />
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}