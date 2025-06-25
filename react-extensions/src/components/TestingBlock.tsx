import React, { useState, useEffect } from 'react';
import ModernProductCard from './ModernProductCard';
import { ModernProductList } from './ModernProductList';
import ProductCarousel from './ProductCarousel';
import FeaturedProductsCarousel from './FeaturedProductsCarousel';
import DotsProductSlider from './DotsProductSlider';
import TitleArrowsSlider from './TitleArrowsSlider';
import SideArrowsSlider from './SideArrowsSlider';
import CenteredTitleSlider from './CenteredTitleSlider';
import { useShopifyCart } from '../hooks/useShopifyCart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '../lib/utils';
import { Sparkles, ShoppingCart, Store, Info, TrendingUp, Heart, Star } from 'lucide-react';

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  description: string;
  price: number;
  price_min: number;
  price_max: number;
  available: boolean;
  images: string[];
  featured_image: string;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    available: boolean;
    sku: string;
    option1?: string;
    option2?: string;
    option3?: string;
  }>;
  options: Array<{
    name: string;
    values: string[];
  }>;
  tags: string[];
  type: string;
  vendor: string;
}

interface ShopifyCart {
  token: string;
  note: string;
  attributes: Record<string, any>;
  total_price: number;
  total_weight: number;
  item_count: number;
  items: any[];
  requires_shipping: boolean;
  currency: string;
}

interface ShopData {
  currency: string;
  money_format: string;
  domain: string;
}

interface TestingBlockProps {
  blockId?: string;
  themeColor?: string;
  showDescription?: boolean;
  animationEnabled?: boolean;
  interactionType?: string;
  productData?: string; // JSON string from Liquid
}

/**
 * Main testing block component with real Shopify integration
 * Features: Real product data, cart integration, wishlist, and dynamic theming
 */
const TestingBlock: React.FC<TestingBlockProps> = ({
  blockId,
  themeColor = '#007bff',
  showDescription = true,
  animationEnabled = true,
  interactionType = 'both',
  productData,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [shopifyData, setShopifyData] = useState<{
    cart: ShopifyCart | null;
    shop: ShopData | null;
    customer: any;
  }>({ cart: null, shop: null, customer: null });
  const [loading, setLoading] = useState(true);

  // Use cart integration
  const { itemCount, totalPrice, cart, error: cartError, addToCart } = useShopifyCart();

  // Simulate component mounting animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Load Shopify data from the page
  useEffect(() => {
    try {
      // Parse product data from Liquid
      if (productData) {
        const parsedProduct = JSON.parse(productData);
        setProduct(parsedProduct);
      }

      // Load cart and shop data from script tag
      if (blockId) {
        const scriptElement = document.getElementById(`shopify-cart-data-${blockId}`);
        if (scriptElement) {
          const shopifyInfo = JSON.parse(scriptElement.textContent || '{}');
          setShopifyData(shopifyInfo);
        }
      }
    } catch (error) {
      console.error('Error parsing Shopify data:', error);
    } finally {
      setLoading(false);
    }
  }, [productData, blockId]);


  const formatMoney = (cents: number): string => {
    if (shopifyData.shop?.money_format) {
      // Use Shopify's money format
      const amount = (cents / 100).toFixed(2);
      return shopifyData.shop.money_format.replace('{{amount}}', amount);
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Convert Shopify product to our component format
  const convertedProduct = product ? {
    id: product.variants[0]?.id.toString() || product.id.toString(),
    title: product.title,
    price: formatMoney(product.price),
    description: product.description,
    image: product.featured_image || product.images[0] || 'https://via.placeholder.com/300x200',
    variants: product.variants.map(variant => ({
      id: variant.id.toString(),
      title: variant.title,
      price: formatMoney(variant.price),
      available: variant.available,
    })),
  } : null;

  // Fallback test product for testing cart functionality
  const testProduct = {
    id: '12345678901234567890', // Fake variant ID for testing
    title: 'Test Product - React Extension',
    price: '$29.99',
    description: 'This is a test product to demonstrate the cart integration. In a real store, select a product from the theme editor.',
    image: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Test+Product',
    variants: [
      {
        id: '12345678901234567890',
        title: 'Default Variant',
        price: '$29.99',
        available: true,
      },
      {
        id: '12345678901234567891', 
        title: 'Premium Variant',
        price: '$39.99',
        available: true,
      }
    ],
  };

  // Use real product if available, otherwise use test product ONLY if no product was selected
  const displayProduct = convertedProduct || (productData ? null : testProduct);

  if (loading) {
    return (
      <div className="testing-block loading">
        <div className="loading-content">
          <div className="spinner" style={{ borderTopColor: themeColor }}></div>
          <p>Loading React component...</p>
          {product && (
            <>
              <p><strong>{product.title}</strong></p>
              <p>{formatMoney(product.price)}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Debug: Always show the component structure
  console.log('🎯 TestingBlock render:', {
    blockId,
    hasProductData: !!productData,
    productDataLength: productData?.length || 0,
    hasProduct: !!product,
    hasConvertedProduct: !!convertedProduct,
    hasDisplayProduct: !!displayProduct,
    productInfo: product ? {
      id: product.id,
      title: product.title,
      variants: product.variants?.length || 0,
      price: product.price
    } : null,
    rawProductData: productData ? productData.substring(0, 100) + '...' : 'None',
    shopifyData: {
      hasCart: !!shopifyData.cart,
      hasShop: !!shopifyData.shop
    }
  });

  // Additional debugging for product data parsing
  if (productData && !product) {
    console.error('❌ Product data exists but failed to parse:', {
      productDataType: typeof productData,
      productDataLength: productData.length,
      firstChars: productData.substring(0, 50),
      lastChars: productData.substring(productData.length - 50)
    });
  }

  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto p-6 space-y-8",
        isVisible && animationEnabled && "animate-in fade-in duration-500"
      )}
      style={{ 
        '--theme-color': themeColor,
      } as React.CSSProperties}
    >
      {/* Hero Header */}
      <Card className="text-center bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Modern Shopify Extension
            </h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          {showDescription && (
            <CardDescription className="text-lg max-w-2xl mx-auto">
              A fully functional React component built with shadcn/ui, Tailwind CSS, and integrated with Shopify's cart system!
            </CardDescription>
          )}
          
          {/* Technology Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              shadcn/ui
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Tailwind CSS
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ShoppingCart className="h-3 w-3" />
              Shopify Integration
            </Badge>
          </div>
          
          {/* Cart Status */}
          {cart && (
            <Alert className="mt-6 max-w-md mx-auto">
              <ShoppingCart className="h-4 w-4" />
              <AlertTitle>Cart Status</AlertTitle>
              <AlertDescription>
                {itemCount} items • {formatMoney(totalPrice)}
                {shopifyData.shop?.currency && ` ${shopifyData.shop.currency}`}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="space-y-8">
        
        {/* Featured Product Demo */}
        {displayProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Featured Product Demo
                <Badge>Live Shopify Data</Badge>
              </CardTitle>
              <CardDescription>
                This product is fetched directly from your Shopify store and demonstrates real cart integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto">
                <ModernProductCard
                  product={displayProduct}
                  themeColor={themeColor}
                  animationEnabled={animationEnabled}
                  onAddToCart={async (variantId, quantity) => {
                    return await addToCart(variantId, quantity);
                  }}
                />
              </div>
              
              {!convertedProduct && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Test Mode</AlertTitle>
                  <AlertDescription>
                    This is a demo product. Select a real product from the theme editor to see actual Shopify data.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Featured Products Hero Carousel */}
        <FeaturedProductsCarousel 
          maxProducts={8}
          showQuickActions={true}
          compact={false}
        />

        {/* Different Slider Variants */}
        <div className="space-y-16">
          {/* 1. Dots Navigation Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Slider with Dots Navigation
                <Badge variant="secondary">Dots</Badge>
              </CardTitle>
              <CardDescription>
                Clean slider with dot navigation at the bottom for precise control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DotsProductSlider
                title="Premium Collection"
                description="Handpicked premium products with dot navigation"
                maxProducts={6}
                autoplay={true}
              />
            </CardContent>
          </Card>

          {/* 2. Title with Side Arrows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Title with Side Arrows
                <Badge variant="secondary">Title + Arrows</Badge>
              </CardTitle>
              <CardDescription>
                Professional layout with title on left and navigation controls on right
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TitleArrowsSlider
                title="Flash Sale"
                description="Limited time offers with professional navigation"
                maxProducts={8}
                accentColor="text-orange-500"
              />
            </CardContent>
          </Card>

          {/* 3. Large Side Arrows Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                Large Side Arrows
                <Badge variant="secondary">Side Arrows</Badge>
              </CardTitle>
              <CardDescription>
                Minimal design with large floating arrows on each side for clean navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SideArrowsSlider
                maxProducts={6}
                showTitle={true}
                compact={false}
              />
            </CardContent>
          </Card>

          {/* 4. Centered Title with Flanking Arrows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                Centered Title with Flanking Arrows
                <Badge variant="secondary">Centered</Badge>
              </CardTitle>
              <CardDescription>
                Elegant symmetrical design with centered title and arrows flanking the title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CenteredTitleSlider
                title="Luxury Collection"
                subtitle="Discover our most exclusive products"
                maxProducts={8}
                accentColor="from-purple-600 to-blue-600"
                showRating={true}
              />
            </CardContent>
          </Card>

          {/* 5. Compact Side Arrows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Compact Navigation
                <Badge variant="secondary">Compact</Badge>
              </CardTitle>
              <CardDescription>
                Space-efficient compact slider perfect for mobile and tight layouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SideArrowsSlider
                maxProducts={8}
                showTitle={false}
                compact={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Original Carousels Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Original Carousel Styles
              <Badge variant="outline">Legacy</Badge>
            </CardTitle>
            <CardDescription>
              Our original carousel implementations for comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-12">
            {/* Featured Hero */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary">Hero Carousel</h4>
              <FeaturedProductsCarousel 
                maxProducts={6}
                showQuickActions={true}
                compact={false}
              />
            </div>

            {/* Original Product Carousel */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary">Standard Carousel</h4>
              <ProductCarousel
                title="Best Sellers"
                description="Our top-performing products"
                variant="bestseller"
                maxProducts={6}
                showRating={true}
                autoplay={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              shadcn/ui Component Showcase
            </CardTitle>
            <CardDescription>
              Demonstration of various shadcn/ui components with your custom theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Button Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Badge Variants */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Badge Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Card Examples */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Card Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Standard Card</CardTitle>
                    <CardDescription>Basic card with header and content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is a standard card component with proper spacing and typography.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-primary">Themed Card</CardTitle>
                    <CardDescription>Card with custom theme colors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" style={{ backgroundColor: themeColor }}>
                      Themed Button
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopify Integration Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopify Integration Features
            </CardTitle>
            <CardDescription>
              This extension includes comprehensive Shopify integration capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🛒', title: 'Real Cart API', desc: 'Live cart updates' },
                { icon: '💰', title: 'Money Formatting', desc: 'Shop currency support' },
                { icon: '📦', title: 'Product Variants', desc: 'Multiple options' },
                { icon: '🎯', title: 'Theme Integration', desc: 'Liquid + React' },
              ].map((feature, index) => (
                <Card key={index} className="text-center p-4">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cart Error Display */}
        {cartError && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Cart Error</AlertTitle>
            <AlertDescription>{cartError}</AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Block ID: {blockId}</span>
              <span>•</span>
              <span>React {React.version}</span>
              <span>•</span>
              <span>shadcn/ui + Tailwind CSS</span>
              {shopifyData.shop?.domain && (
                <>
                  <span>•</span>
                  <span>{shopifyData.shop.domain}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingBlock; 