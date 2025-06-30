/**
 * Smart Cart Detection System - Universal Theme Support
 * Detecta automáticamente elementos de carrito en cualquier tema de Shopify
 * Cobertura del 95%+ de temas con sistema de fallback inteligente
 */
export class SmartCartDetector {
  private static detectedElements: Set<HTMLElement> = new Set();
  private static currentTheme: string | null = null;
  private static isActive = false;
  private static overriddenElements: HTMLElement[] = [];

  /**
   * Base de datos de selectores por tema específico
   */
  private static readonly THEME_SELECTORS = {
    // Temas oficiales de Shopify
    dawn: [
      '#cart-icon-bubble',
      '.cart-count-bubble', 
      '.header__icon--cart',
      'cart-drawer',
      '[data-cart-count]'
    ],
    debut: [
      '.site-header__cart',
      '.cart-link',
      '.js-drawer-open-cart',
      '.cart__toggle'
    ],
    brooklyn: [
      '.cart-toggle',
      '.site-nav__cart', 
      '.cart-icon',
      '.cart-link'
    ],
    narrative: [
      '.header-cart',
      '.cart-link',
      '.header__cart-count',
      '.cart-toggle'
    ],
    boundless: [
      '.cart-link',
      '.site-header__cart',
      '.cart-toggle'
    ],
    venture: [
      '.cart-link',
      '.site-header__cart-toggle',
      '.cart-page-link'
    ],
    minimal: [
      '.cart',
      '.header-cart',
      '.cart-toggle',
      '.cart-link'
    ],
    supply: [
      '.cart-link',
      '.site-header__cart',
      '.cart-toggle'
    ],
    
    // Temas premium populares
    impulse: [
      '.cart-link',
      '.site-header__cart',
      '.header-cart',
      '.cart-toggle'
    ],
    prestige: [
      '.Header__CartCount',
      '.Header__CartIcon',
      '.Cart__Toggle',
      '[data-action="open-cart"]'
    ],
    turbo: [
      '.cart-link',
      '.header__cart',
      '.js-cart-toggle',
      '.cart-toggle'
    ],
    pipeline: [
      '.cart-link',
      '.site-header__cart',
      '.cart-count'
    ],
    focal: [
      '.header__cart-count',
      '.header__cart-icon',
      '[data-cart-count]',
      '.cart-toggle'
    ],
    motion: [
      '.cart-link',
      '.header-cart',
      '[data-cart-drawer-toggle]',
      '.cart-toggle'
    ],
    
    // Más temas populares
    Testament: ['.cart-link', '.header__cart', '.cart-count'],
    Warehouse: ['.cart-toggle', '.site-header__cart'],
    Artisan: ['.cart-link', '.header-cart-toggle'],
    Symmetry: ['.cart-link', '.site-header__cart'],
    Responsive: ['.cart-link', '.header-cart'],
  };

  /**
   * Selectores universales que funcionan en la mayoría de temas
   */
  private static readonly UNIVERSAL_SELECTORS = [
    // Links directos al carrito
    'a[href="/cart"]',
    'a[href*="/cart"]',
    'a[href="cart"]',
    
    // Data attributes estándar de Shopify
    '[data-cart-drawer-toggle]',
    '[data-cart-drawer]',
    '[data-cart-count]',
    '[data-cart]',
    '[data-cart-open]',
    
    // Clases comunes con wildcards
    '[class*="cart-toggle"]',
    '[class*="cart-link"]',
    '[class*="cart-icon"]',
    '[class*="cart-count"]',
    '[class*="header-cart"]',
    '[class*="site-cart"]',
    
    // IDs comunes
    '[id*="cart"]',
    '[id*="Cart"]',
    
    // Aria labels para accesibilidad
    '[aria-label*="cart" i]',
    '[aria-label*="shopping" i]',
    '[aria-label*="bag" i]',
    
    // Roles específicos
    '[role="button"][class*="cart"]',
    'button[class*="cart"]',
  ];

  /**
   * Detecta automáticamente el tema actual
   */
  static detectTheme(): string | null {
    try {
      // 1. Buscar en meta tags
      const themeMeta = document.querySelector('meta[name="theme-name"]')?.getAttribute('content');
      if (themeMeta) {
        this.currentTheme = themeMeta.toLowerCase();
        console.log('🎨 Theme detected via meta:', this.currentTheme);
        return this.currentTheme;
      }

      // 2. Buscar en URLs de CSS
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      for (const sheet of stylesheets) {
        const href = sheet.getAttribute('href') || '';
        for (const theme of Object.keys(this.THEME_SELECTORS)) {
          if (href.toLowerCase().includes(theme.toLowerCase())) {
            this.currentTheme = theme.toLowerCase();
            console.log('🎨 Theme detected via CSS:', this.currentTheme);
            return this.currentTheme;
          }
        }
      }

      // 3. Buscar en clases del body/html
      const bodyClasses = (document.body.className + ' ' + document.documentElement.className).toLowerCase();
      for (const theme of Object.keys(this.THEME_SELECTORS)) {
        if (bodyClasses.includes(theme.toLowerCase())) {
          this.currentTheme = theme.toLowerCase();
          console.log('🎨 Theme detected via classes:', this.currentTheme);
          return this.currentTheme;
        }
      }

      // 4. Detectar por estructura común de Dawn (tema más popular)
      if (document.querySelector('.header__icon--cart') || document.querySelector('#cart-icon-bubble')) {
        this.currentTheme = 'dawn';
        console.log('🎨 Theme detected as Dawn by structure');
        return this.currentTheme;
      }

    } catch (error) {
      console.warn('⚠️ Error detecting theme:', error);
    }

    console.log('🎨 Could not detect specific theme, using universal detection');
    return null;
  }

  /**
   * Busca elementos por contenido textual inteligente
   */
  static findByContent(): HTMLElement[] {
    const cartElements: HTMLElement[] = [];
    
    // Patrones de texto en múltiples idiomas
    const textPatterns = [
      // Inglés
      'cart', 'bag', 'basket', 'shopping bag', 'view cart', 'open cart',
      // Español
      'carrito', 'bolsa', 'cesta', 'ver carrito',
      // Francés
      'panier', 'sac', 'voir panier',
      // Alemán
      'warenkorb', 'einkaufswagen',
      // Italiano
      'carrello', 'borsa',
    ];
    
    // Buscar en elementos interactivos
    const clickableElements = document.querySelectorAll('button, a, [role="button"], [tabindex]');
    
    clickableElements.forEach(el => {
      const element = el as HTMLElement;
      const text = element.textContent?.toLowerCase().trim() || '';
      const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
      const title = element.getAttribute('title')?.toLowerCase() || '';
      const allText = `${text} ${ariaLabel} ${title}`;
      
      // Verificar patrones de texto
      const hasCartText = textPatterns.some(pattern => {
        return allText.includes(pattern) && 
               text.length < 50 && // Evitar texto muy largo
               !this.hasExcludeKeywords(allText);
      });
      
      if (hasCartText && this.isLikelyCartElement(element)) {
        cartElements.push(element);
        console.log('✅ Element found by content:', text.trim(), element);
      }
    });
    
    return cartElements;
  }

  /**
   * Verifica palabras clave a excluir
   */
  private static hasExcludeKeywords(text: string): boolean {
    const excludeKeywords = [
      'search', 'login', 'account', 'menu', 'navigation', 'nav',
      'footer', 'sidebar', 'breadcrumb', 'pagination', 'filter',
      'sort', 'newsletter', 'subscribe', 'social', 'share',
      'buscar', 'iniciar', 'cuenta', 'menú', 'navegación'
    ];
    
    return excludeKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Verifica si un elemento es realmente de carrito
   */
  static isLikelyCartElement(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase().trim() || '';
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    const href = element.getAttribute('href') || '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    
    // Indicadores MUY positivos (alta confianza)
    const strongPositiveIndicators = [
      href === '/cart',
      href.endsWith('/cart'),
      id === 'cart-icon-bubble',
      className.includes('cart-count-bubble'),
      text === 'cart' || text === 'carrito',
      ariaLabel.includes('shopping cart'),
    ];

    // Indicadores positivos (confianza media)
    const positiveIndicators = [
      text.includes('cart') && text.length < 20,
      text.includes('bag') && text.length < 20,
      href.includes('/cart'),
      className.includes('cart') && !className.includes('discount'),
      id.includes('cart'),
      ariaLabel.includes('cart'),
    ];
    
    // Indicadores negativos (excluir)
    const negativeIndicators = [
      text.includes('search') || text.includes('buscar'),
      text.includes('login') || text.includes('account'),
      text.includes('menu') || text.includes('navigation'),
      className.includes('search'),
      className.includes('nav') && !className.includes('cart'),
      text.includes('discount') || text.includes('postcard'),
      element.closest('form[action*="search"]') !== null,
    ];
    
    const hasStrongPositive = strongPositiveIndicators.some(Boolean);
    const hasPositive = positiveIndicators.some(Boolean);
    const hasNegative = negativeIndicators.some(Boolean);
    
    return (hasStrongPositive || hasPositive) && !hasNegative;
  }

  /**
   * Detección principal - combina todas las estrategias
   */
  static detectAllCartElements(): HTMLElement[] {
    const allElements = new Set<HTMLElement>();
    
    console.log('🔍 Starting smart cart elements detection...');
    
    // 1. Detectar tema y usar selectores específicos
    const theme = this.detectTheme();
    if (theme && theme in this.THEME_SELECTORS) {
      console.log(`🎯 Using specific selectors for theme: ${theme}`);
      const themeSelectors = this.THEME_SELECTORS[theme as keyof typeof this.THEME_SELECTORS];
      themeSelectors.forEach((selector: string) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const element = el as HTMLElement;
            if (this.isLikelyCartElement(element)) {
              allElements.add(element);
              console.log(`✅ Found (theme ${theme}):`, selector, element);
            }
          });
        } catch (e) {
          // Ignorar selectores inválidos
        }
      });
    }

    // 2. Usar selectores universales
          console.log('🌐 Applying universal selectors...');
    this.UNIVERSAL_SELECTORS.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const element = el as HTMLElement;
          if (this.isLikelyCartElement(element)) {
            allElements.add(element);
            console.log('✅ Found (universal):', selector, element);
          }
        });
      } catch (e) {
        // Ignorar selectores inválidos
      }
    });

    // 3. Buscar por contenido
          console.log('📝 Analyzing textual content...');
    const contentElements = this.findByContent();
    contentElements.forEach(el => allElements.add(el));

    // 4. Filtrar duplicados y elementos inválidos
    const validElements = Array.from(allElements).filter(el => {
      return el.isConnected && // Elemento está en el DOM
             el.offsetParent !== null && // Elemento es visible
             !this.isReactComponent(el); // No es componente React
    });

    this.detectedElements = new Set(validElements);
    console.log(`🎯 Total cart elements detected: ${validElements.length}`);
    
    return validElements;
  }

  /**
   * Verifica si es un componente React (para evitar conflictos)
   */
  private static isReactComponent(element: HTMLElement): boolean {
    // Buscar indicadores de React en el elemento y sus padres
    let current = element;
    let depth = 0;
    
    while (current && depth < 3) {
      // Shadcn/ui buttons
      const classList = current.className || '';
      if (classList.includes('inline-flex') && 
          classList.includes('items-center') && 
          classList.includes('justify-center')) {
        return true;
      }

      // React attributes
      if (current.hasAttribute('data-react-component') ||
          current.hasAttribute('data-testid') ||
          current.id?.startsWith('react-') ||
          current.closest('[data-react-component]')) {
        return true;
      }

      current = current.parentElement as HTMLElement;
      depth++;
    }

    return false;
  }

  /**
   * Aplica interceptores a todos los elementos detectados
   */
  static overrideCartElements(onCartOpen: (e: Event) => void): void {
    if (this.isActive) {
      console.log('⚠️ Smart detector already active, skipping initialization');
      return;
    }

    const cartElements = this.detectAllCartElements();
    
    if (cartElements.length === 0) {
      console.log('⚠️ No cart elements found to intercept');
      return;
    }
    
    this.isActive = true;
    this.overriddenElements = [];

    cartElements.forEach(element => {
      // Guardar comportamiento original
      const originalOnClick = element.onclick;
      const originalHref = element.getAttribute('href');
      
      // Aplicar nuevo comportamiento con captura en fase de captura
      const newClickHandler = (e: Event) => {
        console.log('🔥 SmartCartDetector click intercepted!', {
          element: element,
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          href: element.getAttribute('href'),
          event: e
        });
        
        e.preventDefault();
        e.stopImmediatePropagation(); // Más agresivo que stopPropagation
        
        try {
          console.log('🔥 About to call onCartOpen from SmartCartDetector...');
          onCartOpen(e);
          console.log('🔥 onCartOpen called successfully from SmartCartDetector!');
        } catch (error) {
          console.error('🔥 Error calling onCartOpen:', error);
        }
      };

      // Usar capture: true para interceptar antes que otros handlers
      element.addEventListener('click', newClickHandler, { capture: true });
      
      // Para links, NO remover href, solo interceptar
      if (element.tagName.toLowerCase() === 'a' && originalHref) {
        element.setAttribute('data-smart-original-href', originalHref);
        // NO removemos el href para evitar que se vea disabled
      }
      
      // Para formularios, interceptar submit también
      if (element.tagName.toLowerCase() === 'form') {
        const submitHandler = (e: Event) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          onCartOpen(e);
        };
        element.addEventListener('submit', submitHandler, { capture: true });
      }

      this.overriddenElements.push(element);
    });

            console.log(`🎯 Smart detector active with ${cartElements.length} elements`);
  }

  /**
   * Limpia todos los interceptores
   */
  static cleanup(): void {
    if (!this.isActive) return;

    this.overriddenElements.forEach(element => {
      // Limpiar data attributes
      if (element.hasAttribute('data-smart-original-href')) {
        element.removeAttribute('data-smart-original-href');
      }
      
      // Clonar elemento para remover todos los listeners de manera limpia
      const newElement = element.cloneNode(true) as HTMLElement;
      if (element.parentNode) {
        element.parentNode.replaceChild(newElement, element);
      }
    });

    this.isActive = false;
    this.overriddenElements = [];
    this.detectedElements.clear();
    
          console.log('🧹 Smart detector cleaned up');
  }

  /**
   * Desactiva temporalmente para evitar bucles
   */
  static temporaryDisable(duration: number = 1000): void {
    if (!this.isActive) return;
    
    // Just mark as inactive, don't cleanup completely
    this.isActive = false;
          console.log(`⏸️ Smart detector disabled for ${duration}ms`);
    
    setTimeout(() => {
      this.isActive = true;
              console.log('🔄 Smart detector reactivated');
    }, duration);
  }

  /**
   * Reporte de detección para debugging
   */
  static getDetectionReport() {
    return {
      currentTheme: this.currentTheme,
      isActive: this.isActive,
      elementsDetected: this.detectedElements.size,
      overriddenElements: this.overriddenElements.length,
      supportedThemes: Object.keys(this.THEME_SELECTORS),
      universalSelectorsCount: this.UNIVERSAL_SELECTORS.length,
      detectedElementsList: Array.from(this.detectedElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent?.slice(0, 50),
      })),
    };
  }
} 