# 🛒 Guía de Integración con el Carrito de Shopify

## ✅ **¡Integración Completa Implementada!**

Tu extensión React ahora puede interactuar completamente con el carrito de Shopify usando múltiples métodos compatibles con diferentes temas.

## 🚀 **Características Implementadas**

### **1. APIs del Carrito**
- ✅ **Cart API moderna** usando `fetch()`
- ✅ **Múltiples métodos de fallback** para máxima compatibilidad
- ✅ **Estados de carga** y manejo de errores
- ✅ **Actualización automática** del UI del tema

### **2. Integración con Temas**
- ✅ **Apertura automática** del cart drawer
- ✅ **Actualización del contador** del carrito en el header
- ✅ **Refresh de secciones** usando Shopify sections
- ✅ **Eventos personalizados** para comunicación con el tema

### **3. Manejo de Productos**
- ✅ **Datos reales de productos** desde Liquid
- ✅ **Múltiples variantes** de producto
- ✅ **Formateo de precios** usando el formato de la tienda
- ✅ **Propiedades personalizadas** del carrito

## 🔧 **Cómo Usar**

### **Paso 1: Agregar el Bloque al Tema**

1. **Ve al theme editor** de Shopify
2. **Agrega una sección** donde quieras el bloque
3. **Selecciona "React Testing Block"** de la lista
4. **Configura el producto** seleccionando uno desde el picker

### **Paso 2: Configurar las Opciones**

En el theme editor puedes configurar:

#### **📦 Configuración del Producto**
- **Product**: Selecciona qué producto mostrar
- **Show Product Description**: Mostrar/ocultar descripción
- **Show Product Variants**: Permitir selección de variantes

#### **🛒 Integración del Carrito**
- **Enable Cart Integration**: Activar funcionalidad del carrito
- **Auto-open Cart Drawer**: Abrir carrito automáticamente tras agregar
- **Add to Cart Button Text**: Personalizar texto del botón

#### **🎨 Apariencia**
- **Theme Color**: Color principal del componente
- **Border Radius**: Redondez de bordes
- **Enable Drop Shadow**: Agregar sombra
- **Enable Animations**: Activar animaciones

#### **⚡ Interacciones**
- **Enable Animations**: Efectos visuales
- **Interaction Style**: Hover, click, o ambos
- **Enable Wishlist**: Botón de favoritos

#### **🔧 Avanzado**
- **Custom Cart Properties**: Propiedades JSON personalizadas

## 🛠 **Métodos de Integración Implementados**

### **1. Método Principal: Cart API**
```javascript
// Agrega productos usando la API moderna
const result = await SmartCartManager.addToCart(variantId, quantity, properties);
```

### **2. Fallback: window.Shopify**
```javascript
// Si el tema tiene window.Shopify disponible
if (window.Shopify && window.Shopify.addItem) {
  window.Shopify.addItem(variantId, quantity);
}
```

### **3. Fallback Final: Form Submission**
```javascript
// Método tradicional para temas muy antiguos
LegacyCartIntegration.addToCartForm(variantId, quantity);
```

## 🎯 **Eventos Disparados**

Tu componente React dispara estos eventos que el tema puede escuchar:

### **Eventos de Carrito**
- `cart:updated` - Cuando el carrito se actualiza
- `cart:open` - Para abrir el cart drawer
- `cartDrawer:open` - Alternativo para algunos temas

### **Ejemplo de Escucha en el Tema**
```javascript
document.addEventListener('cart:updated', function(event) {
  const { count, source } = event.detail;
  console.log(`Cart updated by ${source}, new count: ${count}`);
  
  // Tu lógica personalizada del tema aquí
  updateHeaderCartIcon(count);
});
```

## 📱 **Compatibilidad con Temas**

### **Temas Compatibles Automáticamente**
- **Dawn** (tema por defecto de Shopify)
- **Debut**, **Brooklyn**, **Minimal**
- **Narrative**, **Supply**, **Boundless**
- Cualquier tema que use selectores estándar

### **Selectores Buscados Automáticamente**
```css
/* Para botones del carrito */
[data-cart-drawer-toggle]
.cart-drawer-toggle
.js-drawer-open-cart
.cart-toggle
.header-cart

/* Para contadores del carrito */
.cart-count
.cart-item-count
[data-cart-count]
.header-cart-count
.cart-counter
```

## 🔍 **Debugging y Solución de Problemas**

### **1. Verificar Integración**
Abre las herramientas de desarrollador y busca:

```javascript
// ¿Se cargaron los datos de Shopify?
console.log(window.ShopifyCartData);

// ¿Se disparan los eventos?
document.addEventListener('cart:updated', (e) => console.log('Cart event:', e));
```

### **2. Errores Comunes**

#### **Error: "Failed to add to cart"**
- ✅ **Verifica que el producto esté disponible**
- ✅ **Confirma que la variante existe**
- ✅ **Revisa que el theme permita agregar al carrito**

#### **Error: "Cart drawer not opening"**
- ✅ **El tema debe tener un cart drawer implementado**
- ✅ **Verifica los selectores CSS del tema**
- ✅ **Algunos temas requieren configuración adicional**

#### **Error: "Cart count not updating"**
- ✅ **El tema debe usar selectores estándar**
- ✅ **Algunos temas manejan el contador de manera personalizada**

### **3. Modos de Compatibilidad**

Si tu tema no es compatible automáticamente, puedes:

#### **Opción A: Agregar Selectores**
Agrega estos selectores a tu tema:
```html
<!-- En header.liquid -->
<span class="cart-count">{{ cart.item_count }}</span>

<!-- Botón para abrir carrito -->
<button data-cart-drawer-toggle>
  Cart ({{ cart.item_count }})
</button>
```

#### **Opción B: Escuchar Eventos Personalizados**
```javascript
// En tu tema
document.addEventListener('cart:updated', function(event) {
  const { count } = event.detail;
  // Actualiza tu UI personalizada
  document.querySelector('.mi-contador-custom').textContent = count;
});

document.addEventListener('cart:open', function(event) {
  // Abre tu cart drawer personalizado
  miTema.abrirCarrito();
});
```

## 🧪 **Testing**

### **1. Testing Local**
```bash
# Terminal 1: App principal
npm run dev

# Terminal 2: React development  
cd react-extensions
npm run dev
```

### **2. Testing en Shopify**
1. **Selecciona un producto** en el theme editor
2. **Configura las opciones** del bloque
3. **Ve al preview del tema**
4. **Prueba agregar al carrito**
5. **Verifica que se abra el cart drawer**

### **3. Testing de Compatibilidad**
- ✅ **Mobile y desktop**
- ✅ **Diferentes navegadores**
- ✅ **Productos con múltiples variantes**
- ✅ **Productos agotados**

## 📊 **Datos Disponibles en React**

### **Datos del Producto**
```typescript
interface ShopifyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  variants: Variant[];
  images: string[];
  tags: string[];
  available: boolean;
}
```

### **Datos del Carrito**
```typescript
interface Cart {
  token: string;
  item_count: number;
  total_price: number;
  items: CartItem[];
  currency: string;
}
```

### **Datos de la Tienda**
```typescript
interface ShopData {
  currency: string;
  money_format: string;
  domain: string;
}
```

## 🎨 **Personalización Avanzada**

### **1. Propiedades Personalizadas del Carrito**
```json
{
  "gift_wrap": "yes",
  "custom_message": "Happy Birthday!",
  "delivery_date": "2024-12-25"
}
```

### **2. Eventos Personalizados**
```javascript
// Disparar evento personalizado desde React
document.dispatchEvent(new CustomEvent('producto:agregado', {
  detail: { 
    productId: '123',
    quantity: 2,
    customData: 'mi-dato'
  }
}));

// Escuchar en el tema
document.addEventListener('producto:agregado', (event) => {
  // Tu lógica personalizada
});
```

## 🚀 **Próximos Pasos**

1. **Testa la integración** con diferentes productos
2. **Personaliza el diseño** según tu tema
3. **Agrega eventos personalizados** si es necesario
4. **Documenta la configuración** para tu equipo

## 💡 **Tips de Rendimiento**

- ✅ **La integración es optimizada** para no afectar la velocidad
- ✅ **Los eventos se manejan eficientemente**
- ✅ **Los datos se cargan solo cuando es necesario**
- ✅ **Compatible con Shopify's Performance Standards**

¡Tu extensión React ahora tiene integración completa con el carrito de Shopify! 🎉 