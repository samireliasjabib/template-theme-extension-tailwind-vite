import React, { useState, useEffect } from 'react';
import { useShopifyCart } from '../hooks/useShopifyCart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '../lib/utils';
import { ShoppingCart, Store, Info, Star, Heart, Eye, ChevronDown } from 'lucide-react';

// Real Shopify Product Interface based on proxy data
interface ShopifyRealProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    id: number;
    title: string;
    option1?: string;
    option2?: string;
    option3?: string;
    sku: string;
    requires_shipping: boolean;
    taxable: boolean;
    featured_image?: {
      id: number;
      product_id: number;
      position: number;
      alt: string;
      width: number;
      height: number;
      src: string;
      variant_ids: number[];
    };
    available: boolean;
    price: string;
    grams: number;
    compare_at_price?: string;
    position: number;
    product_id: number;
  }>;
  images?: Array<{
    id: number;
    product_id: number;
    position: number;
    alt: string;
    width: number;
    height: number;
    src: string;
  }>;
  featured_image?: {
    id: number;
    product_id: number;
    position: number;
    alt: string;
    width: number;
    height: number;
    src: string;
  };
}

interface TestingBlockProps {
  blockId?: string;
  themeColor?: string;
  showDescription?: boolean;
  animationEnabled?: boolean;
  interactionType?: string;
  productData?: string;
}

/**
 * Simplified React Extension Widget - Real Products from Proxy with Variant Selection
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
  const [products, setProducts] = useState<ShopifyRealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{[productId: number]: number}>({});

  // Use cart integration
  const { itemCount, totalPrice, cart, error: cartError, addToCart, isAdding, lastAddedItem } = useShopifyCart();

  // Fetch products directly from proxy
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/apps/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_products',
            limit: 8
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.products) {
          setProducts(data.products);
          
          // Set default selected variants (first variant of each product)
          const defaultVariants: {[productId: number]: number} = {};
          data.products.forEach((product: ShopifyRealProduct) => {
            if (product.variants && product.variants.length > 0) {
              defaultVariants[product.id] = product.variants[0].id;
            }
          });
          setSelectedVariants(defaultVariants);
        } else {
          setError('No se pudieron cargar los productos');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar productos del proxy');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatMoney = (price: string): string => {
    const amount = parseFloat(price);
    return `$${amount.toFixed(2)}`;
  };

  const getProductImage = (product: ShopifyRealProduct, variantId?: number): string => {
    // Try to get variant-specific image first
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant?.featured_image?.src) {
        return variant.featured_image.src;
      }
    }

    // Fallback to product featured image
    if (product.featured_image?.src) {
      return product.featured_image.src;
    }

    // Fallback to first image
    if (product.images && product.images.length > 0) {
      return product.images[0].src;
    }

    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const getSelectedVariant = (product: ShopifyRealProduct) => {
    const selectedVariantId = selectedVariants[product.id];
    return product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  };

  const handleVariantChange = (productId: number, variantId: number) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-full max-w-6xl mx-auto p-6",
        isVisible && animationEnabled && "animate-in fade-in duration-500"
      )}
      style={{ 
        '--theme-color': themeColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Productos Destacados
          </h1>
        </div>
        
        {showDescription && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Descubre nuestra selección de productos con integración completa al carrito de Shopify
          </p>
        )}
        
        {/* Cart Status */}
        {cart && itemCount > 0 && (
          <Alert className="max-w-md mx-auto">
            <ShoppingCart className="h-4 w-4" />
            <AlertTitle>Carrito</AlertTitle>
            <AlertDescription>
              {itemCount} productos • ${(totalPrice / 100).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Product Carousel */}
      {products.length > 0 && (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => {
              const selectedVariant = getSelectedVariant(product);
              const productImage = getProductImage(product, selectedVariant?.id);
              
              return (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                  <Card className="group overflow-hidden border shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full">
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={productImage}
                        alt={selectedVariant?.featured_image?.alt || product.title}
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Floating Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Wishlist ${product.title}`);
                          }}
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Quick view ${product.title}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Featured Badge */}
                      {index < 3 && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                          ⭐ Destacado
                        </Badge>
                      )}

                      {/* Sale Badge */}
                      {selectedVariant?.compare_at_price && (
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white font-semibold">
                          OFERTA
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex-1 space-y-3">
                        {product.vendor && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {product.vendor}
                          </p>
                        )}
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3",
                                i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              )} 
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            (4.{Math.floor(Math.random() * 9) + 1})
                          </span>
                        </div>

                        {/* Variant Selector */}
                        {product.variants.length > 1 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Variante:
                            </label>
                            <div className="relative">
                              <select
                                value={selectedVariant?.id || ''}
                                onChange={(e) => handleVariantChange(product.id, parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              >
                                {product.variants.map((variant) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.title} - {formatMoney(variant.price)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        )}

                        {/* Price */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">
                              {formatMoney(selectedVariant?.price || '0')}
                            </span>
                            {selectedVariant?.compare_at_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatMoney(selectedVariant.compare_at_price)}
                              </span>
                            )}
                          </div>
                          {selectedVariant?.available && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Disponible
                            </Badge>
                          )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        className={cn(
                          "w-full h-12 mt-4 font-semibold transition-all duration-300",
                          lastAddedItem === selectedVariant?.id?.toString()
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        disabled={isAdding || !selectedVariant?.available}
                        onClick={async () => {
                          if (selectedVariant?.id) {
                            await addToCart(selectedVariant.id, 1);
                          }
                        }}
                        style={{ backgroundColor: themeColor }}
                      >
                        {isAdding && lastAddedItem === selectedVariant?.id?.toString() ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            Agregando...
                          </>
                        ) : lastAddedItem === selectedVariant?.id?.toString() ? (
                          <>
                            ✓ ¡Agregado!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Agregar al Carrito
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <Card className="text-center py-16">
          <CardContent>
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No hay productos disponibles</CardTitle>
            <CardDescription>
              Agrega productos a tu tienda para ver el widget en acción
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Cart Error Display */}
      {cartError && (
        <Alert variant="destructive" className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Error del Carrito</AlertTitle>
          <AlertDescription>{cartError}</AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <Store className="h-3 w-3" />
            React Extension
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <ShoppingCart className="h-3 w-3" />
            Shopify Integration
          </Badge>
          {blockId && (
            <Badge variant="outline" className="gap-1">
              ID: {blockId}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingBlock; 