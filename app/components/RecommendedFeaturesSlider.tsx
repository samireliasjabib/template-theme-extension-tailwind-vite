import { useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Icon,
} from "@shopify/polaris";
import {
  CreditCardIcon,
  CartIcon,
  EmailIcon,
  NotificationIcon,
  ChartVerticalIcon,
  AutomationIcon,
} from "@shopify/polaris-icons";

interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'post-purchase' | 'checkout' | 'automation' | 'analytics';
  icon: any;
  status: 'recommended' | 'premium' | 'coming-soon';
  benefits: string[];
}

const features: Feature[] = [
  {
    id: 'post-purchase-upsell',
    title: 'Post-Purchase Upsells',
    description: 'Increase AOV with smart product recommendations after checkout completion.',
    category: 'post-purchase',
    icon: CreditCardIcon,
    status: 'recommended',
    benefits: ['30% higher AOV', 'Smart AI recommendations', 'One-click add to order']
  },
  {
    id: 'checkout-bundles',
    title: 'Checkout Bundle Optimizer',
    description: 'Dynamic bundle suggestions during checkout to maximize cart value.',
    category: 'checkout',
    icon: CartIcon,
    status: 'premium',
    benefits: ['Real-time optimization', 'A/B testing', 'Conversion tracking']
  },
  {
    id: 'abandoned-cart',
    title: 'Abandoned Cart Recovery',
    description: 'Automated email sequences with personalized bundle offers.',
    category: 'automation',
    icon: EmailIcon,
    status: 'recommended',
    benefits: ['45% recovery rate', 'Personalized bundles', 'SMS integration']
  },
  {
    id: 'predictive-bundles',
    title: 'Predictive Bundle Analytics',
    description: 'AI-powered insights to predict the best bundle combinations.',
    category: 'analytics',
    icon: ChartVerticalIcon, // Cambiado de AnalyticsIcon
    status: 'premium',
    benefits: ['ML predictions', 'Revenue forecasting', 'Trend analysis']
  },
  {
    id: 'push-notifications',
    title: 'Bundle Push Notifications',
    description: 'Re-engage customers with targeted bundle notifications.',
    category: 'automation',
    icon: NotificationIcon,
    status: 'coming-soon',
    benefits: ['Real-time targeting', 'Behavioral triggers', 'Cross-platform']
  },
  {
    id: 'auto-bundle',
    title: 'Auto-Bundle Creation',
    description: 'Let AI automatically create and test new bundle combinations.',
    category: 'automation',
    icon: AutomationIcon,
    status: 'premium',
    benefits: ['Hands-free optimization', 'Performance tracking', 'Auto-pricing']
  }
];

const categoryColors = {
  'post-purchase': 'success',
  'checkout': 'info',
  'automation': 'warning',
  'analytics': 'critical'
} as const;

const statusColors = {
  'recommended': 'success',
  'premium': 'info',
  'coming-soon': 'critical'
} as const;

export default function RecommendedFeaturesSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <Card>
      <BlockStack gap="500">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="200">
            <Text as="h2" variant="headingLg">
              Recommended Features
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Boost your bundle performance with these powerful features
            </Text>
          </BlockStack>
          
          <InlineStack gap="200">
            <Button onClick={scrollPrev} variant="tertiary" size="slim">
              ←
            </Button>
            <Button onClick={scrollNext} variant="tertiary" size="slim">
              →
            </Button>
          </InlineStack>
        </InlineStack>

        {/* Carousel */}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container" style={{ display: 'flex' }}>
            {features.map((feature) => (
              <div
                key={feature.id}
                className="embla__slide"
                style={{ 
                  flex: '0 0 320px', 
                  minWidth: 0, 
                  marginRight: '16px',
                  height: '100%'
                }}
              >
                <Card>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '400px',
                    padding: '16px'
                  }}>
                    {/* Feature Header */}
                    <div style={{ marginBottom: '16px' }}>
                      <InlineStack gap="300" blockAlign="center">
                        <Box
                          background="bg-surface-secondary"
                          padding="200"
                          borderRadius="200"
                        >
                          <Icon source={feature.icon} tone={categoryColors[feature.category]} />
                        </Box>
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingMd">
                            {feature.title}
                          </Text>
                          <Badge tone={statusColors[feature.status]} size="small">
                            {feature.status.replace('-', ' ')}
                          </Badge>
                        </BlockStack>
                      </InlineStack>
                    </div>

                    {/* Content that grows */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Description */}
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {feature.description}
                      </Text>

                      {/* Benefits */}
                      <BlockStack gap="200">
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          Key Benefits:
                        </Text>
                        {feature.benefits.map((benefit, index) => (
                          <InlineStack key={index} gap="200" blockAlign="center">
                            <Box
                              background="bg-surface-success"
                              padding="025"
                              borderRadius="050"
                              minWidth="6px"
                              minHeight="6px"
                            />
                            <Text as="span" variant="bodySm">
                              {benefit}
                            </Text>
                          </InlineStack>
                        ))}
                      </BlockStack>
                    </div>

                    {/* Action Button - Always at bottom */}
                    <div style={{ marginTop: '16px' }}>
                      <Button
                        fullWidth
                        variant={feature.status === 'recommended' ? 'primary' : 'secondary'}
                        disabled={feature.status === 'coming-soon'}
                      >
                        {feature.status === 'coming-soon' 
                          ? 'Coming Soon' 
                          : feature.status === 'premium' 
                          ? 'Upgrade to Pro' 
                          : 'Enable Feature'
                        }
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </BlockStack>
    </Card>
  );
} 