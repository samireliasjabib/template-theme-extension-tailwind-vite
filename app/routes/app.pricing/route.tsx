import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  InlineStack,
  BlockStack,
  Divider,
  Banner,
  Icon,
  Box,
  ProgressBar,
} from "@shopify/polaris";
import {
  CheckIcon,
  StarIcon,
  ChartHistogramFullIcon,
  PersonIcon,
  CartIcon,
} from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return null;
};

export default function Pricing() {
  // Simulated user order data - in real app this would come from API
  const userMonthlyOrders = 350; // Example: user has 350 orders/month
  
  const plans = [
    {
      id: "starter",
      name: "STARTER",
      price: "$29",
      period: "/month",
      description: "Perfect for new stores getting started",
      orderRange: "0-250 orders/month",
      algorithm: "Smart Product Intelligence",
      algorithmDescription: "AI analyzes your product catalog to find natural bundles using tags and vendor patterns",
      features: [
        { text: "AI bundle suggestions", icon: ChartHistogramFullIcon },
        { text: "Cart drawer widget", icon: CartIcon },
        { text: "Product catalog analysis", icon: CheckIcon },
        { text: "Works immediately", icon: StarIcon },
        { text: "Email support", icon: PersonIcon },
        { text: "14-day free trial", icon: CheckIcon },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "secondary" as const,
      isPopular: false,
      isRecommended: userMonthlyOrders <= 250,
    },
    {
      id: "growing",
      name: "GROWING",
      price: "$59",
      period: "/month",
      description: "Perfect for growing stores with purchase data",
      orderRange: "250-1000 orders/month",
      algorithm: "Behavioral Learning AI",
      algorithmDescription: "AI learns from customer purchase patterns and gets smarter as your store grows",
      features: [
        { text: "Everything in Starter", icon: CheckIcon },
        { text: "Purchase pattern analysis", icon: ChartHistogramFullIcon },
        { text: "Customer behavior insights", icon: PersonIcon },
        { text: "Learning algorithms", icon: StarIcon },
        { text: "Priority support", icon: PersonIcon },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "primary" as const,
      isPopular: true,
      isRecommended: userMonthlyOrders > 250 && userMonthlyOrders <= 1000,
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      price: "$149",
      period: "/month",
      description: "Perfect for high-volume stores with rich data",
      orderRange: "1000+ orders/month",
      algorithm: "Predictive Bundle Intelligence",
      algorithmDescription: "Maximum accuracy AI with deep customer behavior analysis and predictive modeling",
      features: [
        { text: "Everything in Growing", icon: CheckIcon },
        { text: "Predictive bundle suggestions", icon: ChartHistogramFullIcon },
        { text: "API Headless", icon: StarIcon },
        { text: "Dedicated success manager", icon: PersonIcon },
        { text: "Custom API integrations", icon: CartIcon },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
      isPopular: false,
      isRecommended: userMonthlyOrders > 1000,
    },
  ];

  const getRecommendedPlan = () => {
    return plans.find(plan => plan.isRecommended);
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <Page title="Choose Your Plan">
      <Layout>
        <Layout.Section>
          <BlockStack gap="800">
            {/* Header Section */}
            <Box paddingBlockStart="400">
              <BlockStack gap="400" align="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Choose Your Plan
                </Text>
                <Text as="p" alignment="center" tone="subdued" variant="bodyLg">
                  All plans include unlimited products and AI-powered bundle suggestions
                </Text>
              </BlockStack>
            </Box>

            {/* Order Volume Banner with Polaris Progress Bar */}
            <Banner
              title={`Your store: ${userMonthlyOrders.toLocaleString()} orders/month`}
              tone={recommendedPlan ? "info" : "warning"}
            >
              <BlockStack gap="300">
                <Text as="p">
                  {recommendedPlan 
                    ? `We recommend the ${recommendedPlan.name} plan for your store size`
                    : "Let us help you choose the perfect plan for your store"
                  }
                </Text>
                
                {/* Polaris Progress Bar */}
                <Box>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      Plan recommendation based on your order volume:
                    </Text>
                    
                    <ProgressBar 
                      progress={Math.min(95, (userMonthlyOrders / 1200) * 100)} 
                      size="medium"
                      tone="highlight"
                    />
                    
                    <InlineStack gap="400" align="space-between">
                      <Text as="span" variant="bodySm" tone="subdued">
                        Starter (0-250)
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Growing (250-1000)
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Enterprise (1000+)
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
                
                <Text as="p" variant="bodyMd" tone="subdued">
                  Join stores already using BundleAI to create product bundles
                </Text>
              </BlockStack>
            </Banner>

            {/* Pricing Cards */}
            <Box paddingBlockEnd="800">
              <style>{`
                .pricing-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 1rem;
                  align-items: stretch;
                  margin-bottom: 2rem;
                }
                
                .pricing-card {
                  height: 100%;
                  max-height: 600px;
                  display: grid;
                  grid-template-rows: auto auto auto 1fr auto;
                  gap: 1rem;
                  position: relative;
                  overflow: hidden;
                }
                
                .card-header {
                  min-height: 140px;
                }
                
                .algorithm-section {
                  min-height: 100px;
                  display: flex;
                  align-items: flex-start;
                }
                
                .features-section {
                  min-height: 180px;
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start;
                }
                
                .cta-button-section {
                  margin-top: auto;
                }
                
                .floating-badges {
                  position: absolute;
                  top: 1rem;
                  right: 1rem;
                  z-index: 10;
                  display: flex;
                  flex-direction: column;
                  gap: 0.25rem;
                }
                
                .icon-container {
                  width: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  flex-shrink: 0;
                }
                
                @media (max-width: 1024px) {
                  .pricing-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                  }
                  
                  .pricing-card {
                    max-height: none;
                  }
                }
                
                @media (max-width: 640px) {
                  .pricing-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                  }
                  
                  .card-header,
                  .algorithm-section,
                  .features-section {
                    min-height: auto;
                  }
                  
                  .pricing-card {
                    display: flex;
                    flex-direction: column;
                    max-height: none;
                  }
                  
                  .cta-button-section {
                    margin-top: 1rem;
                  }
                }
              `}</style>
              
              <div className="pricing-grid">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <div className="pricing-card" style={{ padding: '1rem' }}>
                      {/* Floating Badges */}
                      <div className="floating-badges">
                        {plan.isPopular && (
                          <Badge tone="success">Most Popular</Badge>
                        )}
                        {plan.isRecommended && (
                          <Badge tone="info">Recommended</Badge>
                        )}
                      </div>

                      {/* Plan Header */}
                      <div className="card-header">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingLg">
                            {plan.name}
                          </Text>
                          
                          <InlineStack gap="100" blockAlign="baseline">
                            <Text as="span" variant="heading2xl" fontWeight="bold">
                              {plan.price}
                            </Text>
                            <Text as="span" tone="subdued" variant="bodyLg">
                              {plan.period}
                            </Text>
                          </InlineStack>
                          
                          <Text as="p" tone="subdued" variant="bodyMd">
                            {plan.description}
                          </Text>
                          
                          <Text as="p" variant="bodySm" tone="subdued" fontWeight="medium">
                            {plan.orderRange}
                          </Text>
                        </BlockStack>
                      </div>

                      {/* Algorithm Description */}
                      <div className="algorithm-section">
                        <Box 
                          padding="300" 
                          background="bg-surface-secondary"
                          borderRadius="200"
                        >
                          <BlockStack gap="200">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {plan.algorithm}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {plan.algorithmDescription}
                            </Text>
                          </BlockStack>
                        </Box>
                      </div>

                      {/* Divider */}
                      <Divider />

                      {/* Features List */}
                      <div className="features-section">
                        <BlockStack gap="200">
                          {plan.features.map((feature, featureIndex) => (
                            <InlineStack key={featureIndex} gap="300" blockAlign="center">
                              <div className="icon-container">
                                <Icon source={feature.icon} tone="base" />
                              </div>
                              <Text as="p" variant="bodyMd">
                                {feature.text}
                              </Text>
                            </InlineStack>
                          ))}
                        </BlockStack>
                      </div>

                      {/* CTA Button */}
                      <div className="cta-button-section">
                        <Button
                          variant={plan.buttonVariant}
                          size="large"
                          fullWidth
                        >
                          {plan.buttonText}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Box>

            {/* Realistic Value Proposition - MOVED AFTER PRICING */}
            <Card>
              <Box padding="400">
                <BlockStack gap="400" align="center">
                  {/* Main headline - more realistic */}
                  <Box 
                    padding="400" 
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200" align="center">
                      <Text as="h2" variant="headingMd" alignment="center">
                        Start creating product bundles in minutes
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                        AI-powered suggestions help you identify products that work well together
                      </Text>
                    </BlockStack>
                  </Box>

                  {/* Realistic benefits */}
                  <InlineStack gap="600" align="center" wrap={true}>
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={CheckIcon} tone="success" />
                      <BlockStack gap="050">
                        <Text as="span" variant="bodyMd" fontWeight="medium">Easy setup</Text>
                        <Text as="span" variant="bodySm" tone="subdued">Install in 5 minutes</Text>
                      </BlockStack>
                    </InlineStack>

                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={CheckIcon} tone="success" />
                      <BlockStack gap="050">
                        <Text as="span" variant="bodyMd" fontWeight="medium">No commitments</Text>
                        <Text as="span" variant="bodySm" tone="subdued">Cancel anytime</Text>
                      </BlockStack>
                    </InlineStack>

                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={CheckIcon} tone="success" />
                      <BlockStack gap="050">
                        <Text as="span" variant="bodyMd" fontWeight="medium">Free trial included</Text>
                        <Text as="span" variant="bodySm" tone="subdued">14 days to try</Text>
                      </BlockStack>
                    </InlineStack>
                  </InlineStack>

                  {/* Trust indicator - Sales focused */}
                  <Box 
                    padding="300" 
                    background="bg-surface-info"
                    borderRadius="200"
                  >
                    <InlineStack gap="200" blockAlign="center" align="center">
                      <Box>
                        <Icon source={ChartHistogramFullIcon} tone="base" />
                      </Box>
                      <Text as="p" variant="bodyMd" alignment="center">
                        <Text as="span" fontWeight="semibold">Increase your average order value</Text> with AI-powered suggestions
                      </Text>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
