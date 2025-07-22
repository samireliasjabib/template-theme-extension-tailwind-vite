import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Grid,
  Layout,
  Page,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../server/shopify.server";
import { validateAndHandleInstallation } from "../../server/installation/installation.service";

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
  const { session, redirect } = await authenticate.admin(request);

  // Get shop domain from the session
  // const shop = session?.shop;
  
  // if (!shop) {
  //   throw new Error("Shop domain not found in session");
  // }

  // // Check installation status and handle redirects
  // try {
  //   const installationResult = await validateAndHandleInstallation(session);
  //   if (installationResult.shouldRedirect) {
  //     return redirect(installationResult.redirectPath);
  //   }
  // } catch (error) {
  //   console.error("Error checking installation status:", error);
  //   // Continue to dashboard even if there's an error
  // }

  return null;
};



export default function Index() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

 



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