import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { authenticate } from "../server/shopify.server";
import { mockCompletedInstallation, mockFirstInstall } from "../server/installation/installation.service";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Banner,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    if (action === "mock-completed") {
      await mockCompletedInstallation(session.shop);
      return { success: true, message: "Mocked completed installation" };
    } else if (action === "mock-first") {
      await mockFirstInstall(session.shop);
      return { success: true, message: "Mocked first install" };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }

  return { success: false, message: "Invalid action" };
};

export default function TestMock() {
  const actionData = useActionData<typeof action>();

  return (
    <Page title="Test Database Mock">
      <Layout>
        <Layout.Section>
          <BlockStack gap="800">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Test Onboarding Flow
                </Text>
                <Text as="p" variant="bodyMd">
                  Use these buttons to mock different database states for testing the onboarding flow.
                </Text>

                {actionData && (
                  <Banner tone={actionData.success ? "success" : "critical"}>
                    {actionData.message}
                  </Banner>
                )}

                <InlineStack gap="400">
                  <Form method="post">
                    <input type="hidden" name="action" value="mock-completed" />
                    <Button submit variant="primary">
                      Mock Completed Installation
                    </Button>
                  </Form>

                  <Form method="post">
                    <input type="hidden" name="action" value="mock-first" />
                    <Button submit variant="secondary">
                      Mock First Install
                    </Button>
                  </Form>
                </InlineStack>

                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    What each button does:
                  </Text>
                  <Text as="p" variant="bodyMd">
                    <strong>Mock Completed Installation:</strong> Sets isFirstInstall=false, completes SHOW_PLAN step, sets next step to VIDEO_DEMO
                  </Text>
                  <Text as="p" variant="bodyMd">
                    <strong>Mock First Install:</strong> Resets to isFirstInstall=true, no completed steps
                  </Text>
                </BlockStack>

                <InlineStack gap="400">
                  <Button url="/app" variant="secondary">
                    Go to Dashboard
                  </Button>
                  <Button url="/app/pricing?onboarding=true" variant="secondary">
                    Go to Pricing
                  </Button>
                  <Button url="/app/onboarding/video-demo" variant="secondary">
                    Go to Video Demo
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 