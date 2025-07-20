import type { Plan } from "./types";

export const PLANS: Plan[] = [
  {
    id: "growth",
    name: "Growth plan",
    price: "Starting from $29.99/month",
    priceDescription: "Charges increase based on store orders up to a maximum of $199.99/month.",
    features: [
      "High converting cart",
      "Customizable design", 
      "Countdown and announcements",
      "Motivator bar for free shipping and discounts",
      "Upsells and add-ons",
      "Discount codes",
      "Notes",
      "Recommended for most stores"
    ],
    isPopular: true,
    buttonText: "Start 14-day free trial",
    buttonVariant: "primary",
  },
  {
    id: "enterprise", 
    name: "Enterprise plan",
    price: "Fixed price of $299.00/month",
    priceDescription: "Charges do not scale with orders. This should only be considered by larger stores.",
    features: [
      "High converting cart",
      "Customizable design",
      "Countdown and announcements", 
      "Motivator bar for free shipping and discounts",
      "Upsells and add-ons",
      "Discount codes",
      "Notes",
      "Priority support in-app and via email"
    ],
    isPopular: false,
    buttonText: "Start 14-day free trial",
    buttonVariant: "secondary",
  }
];