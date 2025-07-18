import type { PeriodOption, CartDrawerPerformanceData, CartActivityData } from "./types";

export const PERIOD_OPTIONS: PeriodOption[] = [
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

export const PERFORMANCE_DATA: CartDrawerPerformanceData = {
  revenue: "$8,420",
  conversionRate: "68%",
  lastUpdated: "Today, 2:45 PM",
  metrics: [
    {
      value: "2.4 min",
      label: "Avg. Time in Cart",
      badge: { text: "↗ Fast", tone: "success" },
      background: "bg-surface-success-subdued"
    },
    {
      value: "+23%",
      label: "Cart Abandonment ↓",
      badge: { text: "↗ +23%", tone: "success" }
    },
    {
      value: "3.2",
      label: "Items per Cart",
      badge: { text: "+0.4", tone: "attention" }
    }
  ]
};

export const ACTIVITY_DATA: CartActivityData = {
  isLive: true,
  items: [
    {
      id: "1",
      action: "Product added from upsell drawer",
      cartValue: "$1,199.00",
      itemCount: 3,
      itemValue: "$299.00",
      timestamp: "2:45 PM"
    },
    {
      id: "2",
      action: "Customer subscribed to out of stock product",
      cartValue: "$1,655.00",
      itemCount: 4,
      itemValue: "$456.00",
      timestamp: "2:38 PM"
    },
    {
      id: "3",
      action: "Cross-sell bundle accepted in drawer",
      cartValue: "$1,210.00",
      itemCount: 5,
      itemValue: "$145.00",
      timestamp: "2:31 PM"
    },
    {
      id: "4",
      action: "Free shipping threshold reached via upsell",
      cartValue: "$1,255.00",
      itemCount: 4,
      itemValue: "$45.00",
      timestamp: "2:18 PM"
    },
    {
      id: "5",
      action: "Discount applied through drawer promotion",
      cartValue: "$1,099.00",
      itemCount: 2,
      itemValue: "-$200.00",
      timestamp: "1:45 PM"
    }
  ]
}; 