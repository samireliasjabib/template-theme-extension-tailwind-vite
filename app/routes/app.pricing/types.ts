export interface Plan {
  id: string;
  name: string;
  price: string;
  priceDescription: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

export interface ActionData {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export interface LoaderData {
  isOnboarding: boolean;
}