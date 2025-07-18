// Types for the dashboard components

export interface PeriodOption {
  label: string;
  value: string;
}

export interface MetricData {
  value: string;
  label: string;
  badge?: {
    text: string;
    tone: 'success' | 'attention' | 'warning' | 'critical' | 'info';
  };
  background?: string;
}

export interface CartActivityItem {
  id: string;
  action: string;
  cartValue: string;
  itemCount: number;
  itemValue: string;
  timestamp: string;
}

export interface CartDrawerPerformanceData {
  revenue: string;
  conversionRate: string;
  metrics: MetricData[];
  lastUpdated: string;
}

export interface CartActivityData {
  items: CartActivityItem[];
  isLive: boolean;
} 