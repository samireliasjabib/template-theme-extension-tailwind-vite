import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Build configuration for Shopify theme assets
  build: {
    // Build directly to the extension's assets directory
    outDir: '../extensions/testing-react-tailwind/assets',
    
    // Don't empty the directory (keep existing assets like thumbs-up.png)
    emptyOutDir: false,
    
    // Generate manifest for asset tracking
    manifest: false,
    
    // Don't minify for easier debugging in development
    minify: process.env.NODE_ENV === 'production',
    
    // Source maps for development
    sourcemap: process.env.NODE_ENV === 'development',
    
    rollupOptions: {
      input: {
        // Entry point for the React application
        'react-testing-block': resolve(__dirname, 'src/index.tsx'),
      },
      
      output: {
        // Naming pattern for generated files
        entryFileNames: '[name].js',
        assetFileNames: '[name].css',
        
        // Don't hash filenames for easier reference in Liquid
        format: 'es',
      },
      
      // External dependencies that should not be bundled
      external: [
        // Shopify-specific globals that might be available
        /^shopify/,
      ],
    },
    
    // Target modern browsers (Shopify's supported range)
    target: 'es2020',
    
    // Asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  
  // Development server configuration
  server: {
    port: 3001,
    host: true,
    cors: true,
    
    // Enable file watching
    hmr: true,
  },
  
  // CSS configuration
  css: {
    // Enable CSS modules if needed
    modules: {
      localsConvention: 'camelCase',
    },
    
    // PostCSS will automatically use postcss.config.js
    postcss: './postcss.config.js',
  },
  
  // TypeScript configuration
  esbuild: {
    // JSX configuration
    jsx: 'automatic',
    
    // Target ES2020 for good browser support
    target: 'es2020',
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
    
    // Pre-bundle these dependencies for faster dev startup
    force: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
  },
  
  // Logging
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
}); 