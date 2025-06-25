/**
 * Shopify Products API Utilities
 * Fetch real products from Shopify's public AJAX endpoints
 */

export interface ShopifyProductAPI {
  id: number;
  title: string;
  handle: string;
  description: string;
  published_at: string;
  created_at: string;
  vendor: string;
  type: string;
  tags: string[];
  price: number;
  price_min: number;
  price_max: number;
  available: boolean;
  price_varies: boolean;
  compare_at_price: number | null;
  compare_at_price_min: number | null;
  compare_at_price_max: number | null;
  compare_at_price_varies: boolean;
  variants: ShopifyVariantAPI[];
  images: string[];
  featured_image: string;
  options: ShopifyOptionAPI[];
  url: string;
}

export interface ShopifyVariantAPI {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image: string | null;
  available: boolean;
  name: string;
  public_title: string;
  options: string[];
  price: number;
  weight: number;
  compare_at_price: number | null;
  inventory_management: string | null;
  barcode: string | null;
}

export interface ShopifyOptionAPI {
  name: string;
  position: number;
  values: string[];
}

export interface ProductsResponse {
  products: ShopifyProductAPI[];
}

/**
 * Shopify Products Fetcher using public AJAX endpoints
 */
export class ShopifyProductsFetcher {
  private static baseUrl = window.location.origin;

  /**
   * Fetch products with multiple fallback strategies
   */
  static async getFeaturedProducts(limit: number = 6): Promise<ShopifyProductAPI[]> {
    console.log('🔍 Fetching real Shopify products...');
    console.log('🌐 Base URL:', this.baseUrl);
    
    // Try multiple strategies to get products
    const strategies = [
      { name: 'products.json', endpoint: '/products.json' },
      { name: 'collections/all', endpoint: '/collections/all/products.json' },
      { name: 'collections/featured', endpoint: '/collections/featured/products.json' },
      { name: 'collections/frontpage', endpoint: '/collections/frontpage/products.json' },
    ];

    for (const strategy of strategies) {
      try {
        console.log(`🔄 Trying strategy: ${strategy.name}`);
        const products = await this.fetchFromEndpoint(strategy.endpoint, limit);
        console.log(`📊 ${strategy.name} returned ${products.length} products`);
        
        if (products.length > 0) {
          // Log all products found (not just available ones)
          console.log(`📦 All products from ${strategy.name}:`, 
            products.map(p => ({ 
              id: p.id, 
              title: p.title, 
              available: p.available, 
              price: p.price_min,
              images: p.images?.length || 0,
              variants: p.variants?.length || 0
            }))
          );
          
          // Filter only available products
          const availableProducts = products.filter(p => p.available);
          console.log(`✅ Available products: ${availableProducts.length}/${products.length}`);
          
          if (availableProducts.length > 0) {
            return availableProducts.slice(0, limit);
          } else {
            console.warn(`⚠️ Found ${products.length} products but none are available`);
            // Return all products even if not available for testing
            return products.slice(0, limit);
          }
        }
      } catch (error) {
        console.warn(`❌ Strategy ${strategy.name} failed:`, error);
      }
    }

    console.warn('❌ No products found with any strategy');
    return [];
  }

  /**
   * Fetch from specific endpoint
   */
  private static async fetchFromEndpoint(endpoint: string, limit: number): Promise<ShopifyProductAPI[]> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${limit}`;
    
    console.log(`🌐 Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error from ${endpoint}:`, errorText);
      throw new Error(`Failed to fetch from ${endpoint}: ${response.status} - ${errorText}`);
    }

    const data: ProductsResponse = await response.json();
    console.log(`📊 Raw API response:`, data);
    
    return data.products || [];
  }

  /**
   * Fetch a single product by handle
   */
  static async getProductByHandle(handle: string): Promise<ShopifyProductAPI | null> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${handle}.js`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      return null;
    }
  }

  /**
   * Search products by query
   */
  static async searchProducts(query: string, limit: number = 10): Promise<ShopifyProductAPI[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status}`);
      }

      const data = await response.json();
      return data.resources?.results?.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Debug function to test all endpoints
   */
  static async debugAllEndpoints(): Promise<void> {
    console.log('🔍 DEBUG: Testing all product endpoints...');
    
    const endpoints = [
      '/products.json?limit=1',
      '/collections/all/products.json?limit=1',
      '/collections/featured/products.json?limit=1',
      '/collections/frontpage/products.json?limit=1',
      '/search/suggest.json?q=*&resources[type]=product&resources[limit]=1',
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`🌐 Testing: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        
        console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 ${endpoint} data:`, data);
        } else {
          const errorText = await response.text();
          console.error(`❌ ${endpoint} error:`, errorText);
        }
      } catch (error) {
        console.error(`❌ ${endpoint} failed:`, error);
      }
    }
  }
}

/**
 * Convert Shopify API product to our component format
 */
export function convertShopifyProduct(apiProduct: ShopifyProductAPI) {
  // Get the best image available
  const productImage = apiProduct.featured_image || 
    (apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images[0] : null) ||
    'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=No+Image';

  // Ensure variants exist and have proper data
  const variants = apiProduct.variants && apiProduct.variants.length > 0 
    ? apiProduct.variants.map(variant => ({
        id: variant.id.toString(),
        title: variant.title || 'Default',
        price: formatShopifyPrice(variant.price),
        originalPrice: variant.price, // Keep original for calculations
        compareAtPrice: variant.compare_at_price ? formatShopifyPrice(variant.compare_at_price) : null,
        available: variant.available,
        sku: variant.sku || '',
        image: variant.featured_image || productImage,
        options: {
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
        }
      }))
    : [{
        id: apiProduct.id.toString(),
        title: 'Default',
        price: formatShopifyPrice(apiProduct.price_min),
        originalPrice: apiProduct.price_min,
        compareAtPrice: apiProduct.compare_at_price_min ? formatShopifyPrice(apiProduct.compare_at_price_min) : null,
        available: apiProduct.available,
        sku: '',
        image: productImage,
        options: {}
      }];

  return {
    id: variants[0].id,
    title: apiProduct.title,
    handle: apiProduct.handle,
    price: formatShopifyPrice(apiProduct.price_min),
    priceMax: apiProduct.price_max !== apiProduct.price_min ? formatShopifyPrice(apiProduct.price_max) : null,
    compareAtPrice: apiProduct.compare_at_price_min ? formatShopifyPrice(apiProduct.compare_at_price_min) : null,
    priceVaries: apiProduct.price_varies,
    description: apiProduct.description || 'No description available',
    image: productImage,
    images: apiProduct.images || [productImage],
    vendor: apiProduct.vendor || '',
    type: apiProduct.type || '',
    tags: apiProduct.tags || [],
    available: apiProduct.available,
    variants: variants,
    options: apiProduct.options || [],
    url: apiProduct.url || `/products/${apiProduct.handle}`,
  };
}

/**
 * Format Shopify price (cents to currency)
 */
export function formatShopifyPrice(cents: number): string {
  if (typeof cents !== 'number') return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
} 