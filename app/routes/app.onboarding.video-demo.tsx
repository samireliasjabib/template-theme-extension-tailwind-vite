import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticate } from "../server/shopify.server";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Banner,
  Box,
  MediaCard,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function VideoDemo() {
  return (
    <Page title="How UpCart Works">
      <Layout>
        <Layout.Section>
          <BlockStack gap="800">
            {/* Header */}
            <Box paddingBlockStart="400">
              <BlockStack gap="400" align="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  See UpCart in Action
                </Text>
                <Text as="p" alignment="center" tone="subdued" variant="bodyLg">
                  Watch how easy it is to set up and use UpCart to boost your sales
                </Text>
              </BlockStack>
            </Box>

            {/* Video Demo */}
            <Card>
              <BlockStack gap="600">
                <Text as="h2" variant="headingMd">
                  Quick Setup Guide
                </Text>
                
                <Card>
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      UpCart Setup & Demo
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Learn how to configure your cart drawer, add upsells, and start increasing your average order value in just 3 minutes.
                    </Text>
                    
                    {/* YouTube Video Embed */}
                    <Box paddingBlockStart="400">
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                          title="UpCart Demo Video"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </Box>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Card>

            {/* Key Benefits */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  What You'll Learn
                </Text>
                
                <BlockStack gap="300">
                  <Text as="p" variant="bodyMd">
                    • How to customize your cart drawer design
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Setting up AI-powered product recommendations
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Adding upsells and cross-sells to increase AOV
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Understanding your analytics and performance
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Navigation */}
            <Box paddingBlockEnd="800">
              <InlineStack gap="400" align="space-between">
                <Button 
                  variant="secondary" 
                  url="/app/pricing?onboarding=true"
                >
                  ← Back to Plans
                </Button>
                
                <Button 
                  variant="primary" 
                  url="/app"
                >
                  Continue to Dashboard →
                </Button>
              </InlineStack>
            </Box>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 