import { 
  ProductsApiResponseSchema, 
  processShopifyProduct,
  type ProductsApiResponse, 
  type ShopifyProduct 
} from '../types/shopify.types';

/**
 * Enhanced Shopify API Service with robust validation and error handling
 * Now handles real-world API inconsistencies gracefully
 */
export class ShopifyApiService {
  private static baseUrl = '/apps/recommendations';

  /**
   * Fetch products with enhanced validation and data transformation
   */
  static async fetchProducts(limit: number = 12): Promise<{
    success: boolean;
    products: ShopifyProduct[];
    error?: string;
  }> {
    try {
      console.log('🔄 Fetching products from Shopify API...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_products',
          limit
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('📥 Raw API response:', rawData);

      // Validate with Zod - now more forgiving
      const validationResult = ProductsApiResponseSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        console.warn('⚠️ Some API data validation issues (handling gracefully):', validationResult.error);
        
        // Try to extract what we can from the raw data
        if (rawData.success && rawData.products && Array.isArray(rawData.products)) {
          console.log('🔧 Attempting to process products despite validation issues...');
          
          // Filter and process products that have minimum required fields
          const processedProducts = rawData.products
            .filter((product: any) => 
              product.id && 
              product.title && 
              product.variants && 
              Array.isArray(product.variants) && 
              product.variants.length > 0
            )
            .map((product: any) => {
              try {
                // Manually ensure required fields have defaults
                const cleanProduct = {
                  ...product,
                  vendor: product.vendor || '',
                  product_type: product.product_type || '',
                  tags: Array.isArray(product.tags) ? product.tags : [],
                  images: Array.isArray(product.images) ? product.images.filter((img: any) => img.src) : [],
                  variants: product.variants.map((variant: any) => ({
                    ...variant,
                    sku: variant.sku || '',
                    requires_shipping: variant.requires_shipping ?? true,
                    taxable: variant.taxable ?? true,
                    available: variant.available ?? true,
                  }))
                };
                
                return processShopifyProduct(cleanProduct);
              } catch (error) {
                console.warn('⚠️ Skipping problematic product:', product.id, error);
                return null;
              }
            })
            .filter(Boolean);

          if (processedProducts.length > 0) {
            console.log(`✅ Successfully processed ${processedProducts.length} products (with fixes)`);
            return {
              success: true,
              products: processedProducts
            };
          }
        }
        
        return {
          success: false,
          products: [],
          error: 'Unable to process API data - invalid format'
        };
      }

      const validatedData = validationResult.data;

      if (!validatedData.success || !validatedData.products) {
        return {
          success: false,
          products: [],
          error: validatedData.error || 'No products found'
        };
      }

      // Process and transform the validated data
      const processedProducts = validatedData.products.map(processShopifyProduct);

      console.log(`✅ Successfully validated and processed ${processedProducts.length} products`);
      
      return {
        success: true,
        products: processedProducts
      };

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        products: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate single product with fallback processing
   */
  static validateProduct(productData: unknown): ShopifyProduct | null {
    try {
      // Try strict validation first
      const result = ProductsApiResponseSchema.safeParse({
        success: true,
        products: [productData]
      });
      
      if (result.success && result.data.products?.[0]) {
        return processShopifyProduct(result.data.products[0]);
      }

      // Fallback: try to extract what we can
      if (typeof productData === 'object' && productData !== null) {
        const product = productData as any;
        if (product.id && product.title && product.variants) {
          console.log('🔧 Using fallback product validation...');
          return processShopifyProduct({
            ...product,
            vendor: product.vendor || '',
            product_type: product.product_type || '',
            tags: Array.isArray(product.tags) ? product.tags : [],
            images: Array.isArray(product.images) ? product.images : [],
            variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
              ...v,
              sku: v.sku || '',
              requires_shipping: v.requires_shipping ?? true,
              taxable: v.taxable ?? true,
              available: v.available ?? true,
            })) : []
          });
        }
      }

      return null;
    } catch {
      return null;
    }
  }
} 