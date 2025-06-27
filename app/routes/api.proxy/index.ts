import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { verifyProxy } from "./helpers";

/**
 * Handle GET requests to the proxy endpoint (for debugging)
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
    console.log('🔄 Proxy GET request received (for debugging):', request.url);
    
    try {
        const { shop } = await verifyProxy(request);
        console.log('✅ GET Verified shop:', shop);
        
        return json({
            success: true,
            shop,
            message: "GET request successful - use POST for real data",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Proxy GET error:', error);
        return json(
            { 
                success: false,
                error: error instanceof Error ? error.message : "Failed to process GET request",
                shop: null 
            }, 
            { status: 500 }
        );
    }
};

/**
 * Handle POST requests to the proxy endpoint
 */
export const action = async ({ request }: ActionFunctionArgs) => {
    console.log('🔄 Proxy POST request received:', request.url);
    
    try {
        // Verify the request comes from Shopify
        const { shop } = await verifyProxy(request);
        const { admin } = await authenticate.public.appProxy(request);
        console.log('✅ Verified shop:', shop);
        
        // Get the POST body data
        let requestData: any = {};
        try {
            requestData = await request.json();
            console.log('📦 Request data:', requestData);
        } catch (e) {
            console.log('📦 No JSON body, checking form data...');
            const formData = await request.formData();
            requestData = Object.fromEntries(formData);
            console.log('📦 Form data:', requestData);
        }
        
        // Process the request based on action
        const action = requestData.action || 'default';
        
        switch (action) {
            case 'get_recommendations':
            case 'get_products': {
                const products = await getProductsFromShopify(request, shop, admin);
                
                return json({
                    success: true,
                    products: products,
                    count: products.length,
                    shop: shop,
                    timestamp: new Date().toISOString()
                });
            }
                
            default: {
                return json({
                    success: true,
                    shop,
                    action,
                    message: "Default action processed",
                    timestamp: new Date().toISOString()
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Proxy action error:', error);
        return json(
            { 
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch products from Shopify",
                message: "Check authentication and permissions",
                shop: null 
            }, 
            { status: 500 }
        );
    }
};

/**
 * Get real products from Shopify using WORKING GraphQL query
 */
async function getProductsFromShopify(request: Request, shop: string, admin: any) {
    console.log('🏪 Getting products from Admin API for shop:', shop);
    
    try {
        // Authenticate with Shopify Admin API
        console.log('✅ Admin API authenticated');

        const response = await admin.graphql(`
            #graphql
            query GetWorkingProducts($first: Int!) {
                products(
                    first: $first,
                    sortKey: UPDATED_AT,
                    reverse: true
                ) {
                    nodes {
                        id
                        title
                        handle
                        description
                        descriptionHtml
                        vendor
                        productType
                        tags
                        status
                        totalInventory
                        createdAt
                        updatedAt
                        publishedAt
                        
                    
                        
                        # Compare at price range
                        compareAtPriceRange {
                            minVariantCompareAtPrice {
                                amount  
                            }
                            maxVariantCompareAtPrice {
                                amount
                            }
                        }
                        
                        # Featured media (main image)
                        featuredMedia {
                            ... on MediaImage {
                                id
                                image {
                                    url
                                    altText
                                    width
                                    height
                                }
                            }
                        }
                        
                        # All media (images, videos, etc.)
                        media(first: 10) {
                            nodes {
                                ... on MediaImage {
                                    id
                                    image {
                                        url
                                        altText
                                        width
                                        height
                                    }
                                }
                            }
                        }
                        
                        # Product options (size, color, etc.)
                        options {
                            id
                            name
                            values
                        }
                        
                        variants(first: 50) {
                            nodes {
                                id
                                title
                                price
                                compareAtPrice
                                inventoryQuantity
                
                                barcode
                          
                                # Selected options (Size: Large, Color: Red)
                                selectedOptions {
                                    name
                                    value
                                }
                                
                                # Variant image
                                image {
                                    url
                                    altText
                                    width
                                    height
                                }
                            }
                        }
                        
                    }
                }
            }
        `, {
            variables: {
                first: 20
            }
        });

        const data = await response.json();
        console.log('✅ GraphQL response received');
        
        // Check for GraphQL errors
        if ((data as any)?.errors) {
            console.error('❌ GraphQL errors:', (data as any).errors);
            throw new Error(`GraphQL errors: ${JSON.stringify((data as any).errors)}`);
        }
        
        if (!data.data?.products?.nodes || data.data.products.nodes.length === 0) {
            console.log('⚠️ No products found in store');
            throw new Error('No products found in your Shopify store');
        }

        // Transform GraphQL response to our format
        const products = data.data.products.nodes.map((product: any) => {
            const mainVariant = product.variants?.nodes?.[0];
            
            // Handle pricing
            const minPrice = product.priceRangeV2?.minVariantPrice?.amount || '0';
            const maxPrice = product.priceRangeV2?.maxVariantPrice?.amount || minPrice;
            const currency = product.priceRangeV2?.minVariantPrice?.currencyCode || 'USD';
            
            // Handle compare at pricing
            const compareAtPriceMin = product.compareAtPriceRange?.minVariantPrice?.amount;
            
            // Handle media structure
            const featuredImageUrl = product.featuredMedia?.image?.url || 
                                    product.media?.nodes?.[0]?.image?.url ||
                                    'https://via.placeholder.com/400x400/f8f9fa/6c757d?text=No+Image';
            
            // Check if product has available variants
            
            return {
                id: parseInt(product.id.replace('gid://shopify/Product/', '')),
                title: product.title,
                handle: product.handle,
                body_html: product.descriptionHtml || product.description || '',
                published_at: product.publishedAt,
                created_at: product.createdAt,
                updated_at: product.updatedAt,
                vendor: product.vendor || '',
                product_type: product.productType || '',
                tags: product.tags || [],
                
                // Transform variants to match expected format
                variants: product.variants?.nodes?.map((variant: any) => ({
                    id: parseInt(variant.id.replace('gid://shopify/ProductVariant/', '')),
                    title: variant.title,
                    option1: variant.selectedOptions?.[0]?.value,
                    option2: variant.selectedOptions?.[1]?.value,
                    option3: variant.selectedOptions?.[2]?.value,
                    sku: variant.sku,
                    requires_shipping: variant.requiresShipping,
                    taxable: variant.taxable,
                    featured_image: variant.image ? {
                        id: Math.floor(Math.random() * 1000000),
                        product_id: parseInt(product.id.replace('gid://shopify/Product/', '')),
                        position: 1,
                        alt: variant.image.altText || product.title,
                        width: variant.image.width,
                        height: variant.image.height,
                        src: variant.image.url,
                        variant_ids: [parseInt(variant.id.replace('gid://shopify/ProductVariant/', ''))]
                    } : null,
                    price: variant.price,
                    grams: variant.weight || 0,
                    compare_at_price: variant.compareAtPrice,
                    position: 1,
                    product_id: parseInt(product.id.replace('gid://shopify/Product/', ''))
                })) || [],
                
                // Add images array
                images: product.media?.nodes?.map((media: any, index: number) => ({
                    id: Math.floor(Math.random() * 1000000),
                    product_id: parseInt(product.id.replace('gid://shopify/Product/', '')),
                    position: index + 1,
                    alt: media.image?.altText || product.title,
                    width: media.image?.width || 400,
                    height: media.image?.height || 400,
                    src: media.image?.url
                })) || [],
                
                // Add featured image
                featured_image: product.featuredMedia?.image ? {
                    id: Math.floor(Math.random() * 1000000),
                    product_id: parseInt(product.id.replace('gid://shopify/Product/', '')),
                    position: 1,
                    alt: product.featuredMedia.image.altText || product.title,
                    width: product.featuredMedia.image.width,
                    height: product.featuredMedia.image.height,
                    src: product.featuredMedia.image.url
                } : null
            };
        });

        console.log(`✅ Successfully transformed ${products.length} products from Shopify`);
        return products;

    } catch (error) {
        console.error('❌ Error fetching products from Shopify:', error);
        throw error; // Re-throw instead of returning fallback
    }
}
