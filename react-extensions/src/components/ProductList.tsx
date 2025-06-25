import React from 'react';
import ProductCard from './ProductCard';
import { useShopifyProducts } from '../hooks/useShopifyProducts';

interface ProductListProps {
  className?: string;
  maxProducts?: number;
  showSearch?: boolean;
}

/**
 * ProductList Component - Displays real Shopify products with cart integration
 * Fetches products automatically from Shopify AJAX endpoints
 */
export const ProductList: React.FC<ProductListProps> = ({
  className = '',
  maxProducts = 6,
  showSearch = true,
}) => {
  const {
    convertedProducts,
    loading,
    error,
    hasProducts,
    fetchProducts,
    searchProducts,
    isSearching,
    lastQuery,
  } = useShopifyProducts(true);

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchProducts(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  const displayProducts = convertedProducts.slice(0, maxProducts);

  return (
    <div className={`product-list ${className}`}>
      {/* Header */}
      <div className="product-list-header">
        <h3 className="product-list-title">
          {lastQuery ? `Search Results for "${lastQuery}"` : 'Featured Products'}
        </h3>
        
        {/* Search Form */}
        {showSearch && (
          <form onSubmit={handleSearch} className="product-search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="search-input"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="search-button"
              >
                {isSearching ? '🔍' : '🔍'}
              </button>
              {lastQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="clear-search-button"
                  disabled={loading}
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Loading State */}
      {(loading || isSearching) && (
        <div className="product-list-loading">
          <div className="loading-spinner"></div>
          <p>{isSearching ? 'Searching products...' : 'Loading products...'}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="product-list-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Unable to load products</h4>
            <p>{error}</p>
            <button 
              onClick={fetchProducts} 
              className="retry-button"
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !hasProducts && (
        <div className="product-list-empty">
          <div className="empty-icon">📦</div>
          <div className="empty-content">
            <h4>No products found</h4>
            <p>
              {lastQuery 
                ? `No products match "${lastQuery}". Try a different search term.`
                : 'No products are available in this store.'
              }
            </p>
            {lastQuery && (
              <button onClick={handleClearSearch} className="show-all-button">
                Show All Products
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && hasProducts && (
        <div className="products-grid">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              themeColor="var(--primary-color, #6366f1)"
              animationEnabled={true}
            />
          ))}
        </div>
      )}

      {/* Products Count */}
      {hasProducts && convertedProducts.length > maxProducts && (
        <div className="products-count">
          <p>
            Showing {displayProducts.length} of {convertedProducts.length} products
          </p>
        </div>
      )}
    </div>
  );
}; 