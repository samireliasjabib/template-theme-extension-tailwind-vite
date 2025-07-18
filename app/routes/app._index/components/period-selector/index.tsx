import { Select } from "@shopify/polaris";
import type { PeriodOption } from "../../types";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  options: PeriodOption[];
}

/**
 * PeriodSelector component for selecting time periods in analytics
 * @param selectedPeriod - Currently selected period value
 * @param onPeriodChange - Callback when period changes
 * @param options - Array of period options to display
 */
export function PeriodSelector({ 
  selectedPeriod, 
  onPeriodChange, 
  options 
}: PeriodSelectorProps) {
  return (
    <Select
      label=""
      options={options}
      value={selectedPeriod}
      onChange={onPeriodChange}
    />
  );
} 