import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  LayoutGrid, 
  Grid, 
  Columns, 
  Rows3,
  Filter, 
  SortAsc, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CarouselMode } from '../../hooks/useCarouselMode';

interface ProductControlsProps {
  // View mode controls
  viewMode: CarouselMode;
  onViewModeChange: (mode: CarouselMode) => void;
  
  // Filter controls
  filterByVendor: string;
  vendors: string[];
  onVendorChange: (vendor: string) => void;
  
  // Sort controls
  sortBy: 'name' | 'price' | 'vendor';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'price' | 'vendor', order: 'asc' | 'desc') => void;
  
  // Data
  filteredCount: number;
  totalCount: number;
  
  // Actions
  onResetFilters: () => void;
}

/**
 * Product Controls Component
 * Handles view mode switching, filtering, and sorting controls
 */
export function ProductControls({
  viewMode,
  onViewModeChange,
  filterByVendor,
  vendors,
  onVendorChange,
  sortBy,
  sortOrder,
  onSortChange,
  filteredCount,
  totalCount,
  onResetFilters,
}: ProductControlsProps) {
  
  const viewModeButtons = [
    {
      mode: 'grid' as CarouselMode,
      icon: Grid,
      label: 'Grid',
      description: 'Grid view'
    },
    {
      mode: 'carousel' as CarouselMode,
      icon: LayoutGrid,
      label: 'Carousel',
      description: 'Standard carousel'
    },
    {
      mode: 'carousel-dots' as CarouselMode,
      icon: Columns,
      label: 'With Dots',
      description: 'Carousel with dots'
    },
    {
      mode: 'carousel-vertical' as CarouselMode,
      icon: Rows3,
      label: 'Vertical',
      description: 'Vertical carousel'
    }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'vendor', label: 'Brand' },
  ] as const;

  const hasActiveFilters = filterByVendor !== 'all' || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Display Mode
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {viewModeButtons.map(({ mode, icon: Icon, label, description }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "px-3 py-2 text-xs font-medium transition-all",
                  viewMode === mode 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                )}
                title={description}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredCount} of {totalCount} products
          </Badge>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs h-7"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Vendor Filter */}
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Brand:
          </label>
          <select
            value={filterByVendor}
            onChange={(e) => onVendorChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-w-[120px]"
          >
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor === 'all' ? 'All Brands' : vendor}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'name' | 'price' | 'vendor', sortOrder)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-w-[80px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-7 px-2"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <div className={cn(
              "transition-transform",
              sortOrder === 'desc' && "rotate-180"
            )}>
              <SortAsc className="h-3 w-3" />
            </div>
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Active filters:</span>
          
          {filterByVendor !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Brand: {filterByVendor}
              <button
                onClick={() => onVendorChange('all')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {(sortBy !== 'name' || sortOrder !== 'asc') && (
            <Badge variant="outline" className="text-xs">
              Sort: {sortOptions.find(opt => opt.value === sortBy)?.label} ({sortOrder})
              <button
                onClick={() => onSortChange('name', 'asc')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 