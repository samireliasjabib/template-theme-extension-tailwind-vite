import React, { useState } from 'react';
import { useShopifyCart } from '../hooks/useShopifyCart';

interface Product {
  id: string;
  title: string;
  handle?: string;
  price: string;
  priceMax?: string;
  compareAtPrice?: string;
  priceVaries?: boolean;
  description: string;
  image: string;
  images?: string[];
  vendor?: string;
  type?: string;
  tags?: string[];
  available?: boolean;
  variants?: Array<{
    id: string;
    title: string;
    price: string;
    originalPrice?: number;
    compareAtPrice?: string;
    available: boolean;
    sku?: string;
    image?: string;
    options?: {
      option1?: string;
      option2?: string;
      option3?: string;
    };
  }>;
  options?: Array<{
    name: string;
    values: string[];
  }>;
}

interface ProductCardProps {
  product: Product;
  themeColor: string;
  animationEnabled: boolean;
}

/**
 * Product card component with real Shopify cart integration
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  themeColor,
  animationEnabled,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0]?.id || product.id
  );
  
  // Get selected variant data
  const selectedVariantData = product.variants?.find(v => v.id === selectedVariant) || product.variants?.[0];
  
  // Use the Shopify cart hook
  const { 
    addToCart, 
    isAdding, 
    error, 
    lastAddedItem, 
    openCart,
    itemCount 
  } = useShopifyCart();

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    const variantId = selectedVariant || product.id;
    
    // Add custom properties if needed
    const properties = {
      'Added from': 'React Extension',
      'Component': 'ProductCard',
      'Theme Color': themeColor,
      'Product': product.title,
      'Variant': selectedVariantData?.title || 'Default',
    };

    const success = await addToCart(variantId, quantity, properties);
    
    if (success) {
      // Optionally open cart drawer after adding
      setTimeout(() => {
        openCart();
      }, 500);
    }
  };

  const isJustAdded = lastAddedItem === selectedVariant;

  return (
    <div 
      className={`product-card ${animationEnabled ? 'animated' : ''} ${isJustAdded ? 'just-added' : ''}`}
      style={{ borderColor: themeColor }}
    >
      <div className="product-image-container">
        <img
          src={selectedVariantData?.image || product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=No+Image';
          }}
        />
        <button
          onClick={handleLike}
          className={`like-button ${isLiked ? 'liked' : ''} ${animationEnabled ? 'animated' : ''}`}
          style={{ color: isLiked ? themeColor : '#ccc' }}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        
        {/* Cart count badge */}
        {itemCount > 0 && (
          <div className="cart-badge" style={{ backgroundColor: themeColor }}>
            {itemCount}
          </div>
        )}

        {/* Vendor/Brand */}
        {product.vendor && (
          <div className="product-vendor" style={{ backgroundColor: themeColor }}>
            {product.vendor}
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h5 className="product-title" style={{ color: themeColor }}>
          {product.title}
        </h5>
        
        <p className="product-description">
          {product.description}
        </p>
        
        {/* Price display with variants */}
        <div className="product-pricing">
          <div className="product-price" style={{ color: themeColor }}>
            <strong>{selectedVariantData?.price || product.price}</strong>
            {selectedVariantData?.compareAtPrice && (
              <span className="compare-price">
                {selectedVariantData.compareAtPrice}
              </span>
            )}
          </div>
          {product.priceVaries && product.priceMax && (
            <small className="price-range">
              {product.price} - {product.priceMax}
            </small>
          )}
        </div>

        {/* Variant selector if multiple variants */}
        {product.variants && product.variants.length > 1 && (
          <div className="variant-selector">
            <label htmlFor={`variant-${product.id}`}>Variante:</label>
            <select
              id={`variant-${product.id}`}
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              style={{ borderColor: themeColor }}
            >
              {product.variants.map((variant) => (
                <option 
                  key={variant.id} 
                  value={variant.id}
                  disabled={!variant.available}
                >
                  {variant.title} - {variant.price}
                  {!variant.available && ' (Agotado)'}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="product-controls">
          <div className="quantity-selector">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="quantity-btn"
              style={{ borderColor: themeColor, color: themeColor }}
              disabled={quantity <= 1 || isAdding}
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="quantity-btn"
              style={{ borderColor: themeColor, color: themeColor }}
              disabled={isAdding}
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedVariantData?.available}
            className={`add-to-cart-btn ${animationEnabled ? 'animated' : ''} ${isJustAdded ? 'success' : ''}`}
            style={{ 
              backgroundColor: isJustAdded ? '#28a745' : themeColor,
              opacity: (isAdding || !selectedVariantData?.available) ? 0.7 : 1,
            }}
          >
            {isAdding ? (
              <>
                <span className="loading-spinner"></span>
                Agregando...
              </>
            ) : isJustAdded ? (
              <>
                ✓ ¡Agregado!
              </>
            ) : !selectedVariantData?.available ? (
              'Agotado'
            ) : (
              'Agregar al Carrito'
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="error-message" style={{ color: '#dc3545' }}>
            <small>{error}</small>
          </div>
        )}

        {/* Success message */}
        {isJustAdded && (
          <div className="success-message" style={{ color: '#28a745' }}>
            <small>
              ✓ {quantity} x {product.title} agregado al carrito! 
              <button 
                onClick={openCart}
                className="view-cart-link"
                style={{ color: '#28a745' }}
              >
                Ver carrito
              </button>
            </small>
          </div>
        )}

        {/* Product meta */}
        {(product.type || product.tags?.length) && (
          <div className="product-meta">
            {product.type && (
              <span className="product-type" style={{ color: '#6c757d' }}>
                {product.type}
              </span>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag" style={{ borderColor: themeColor }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 