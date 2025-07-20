import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "../../server/shopify.server";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { VideoCard, BenefitsCard, PrimaryAction } from "./components";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Validate that the user is logged in
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "continueToDashboard") {
    // Complete the VIDEO_DEMO onboarding step
    const { session } = await authenticate.admin(request);
    // await completeOnboardingStep(session.shop, "VIDEO_DEMO");
    
    return redirect("/app");
  }

  return null;
};

export default function VideoDemo() {
  return (
    <Page 
      title="How UpCart Works" 
      subtitle="Step 2 of 3"
      narrowWidth
      primaryAction={<PrimaryAction />}
    >
      <Layout>
        <Layout.Section >
          <BlockStack gap="200" >
            <BenefitsCard />
            <div style={{ marginBottom: '10px' }}>
                <VideoCard />
            </div>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 