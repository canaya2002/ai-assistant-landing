// next.config.ts - COMPATIBLE CON NEXT.JS 15.5.2
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ✅ CONFIGURACIÓN DE IMÁGENES OPTIMIZADA
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    unoptimized: false,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // ✅ FORMATOS OPTIMIZADOS PARA MÓVILES
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // ✅ CONFIGURACIÓN PARA PWA
    minimumCacheTTL: 60,
  },

  // ✅ CONFIGURACIÓN ACTUALIZADA PARA NEXT.JS 15
  serverExternalPackages: ['firebase-admin'],

  // ✅ HEADERS DE SEGURIDAD Y PERFORMANCE
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ✅ SEGURIDAD
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          
          // ✅ PERFORMANCE Y MÓVILES
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge'
          },
          
          // ✅ PWA SUPPORT
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ],
      },
      
      // ✅ HEADERS ESPECÍFICOS PARA ARCHIVOS ESTÁTICOS
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      
      // ✅ HEADERS PARA VIDEOS (OPTIMIZACIÓN MÓVIL)
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes'
          }
        ]
      }
    ];
  },

  // ✅ REDIRECTS OPTIMIZADOS
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/chat',
        permanent: true,
      },
      
      // ✅ REDIRECTS PARA MÓVILES
      {
        source: '/mobile',
        destination: '/chat',
        permanent: false,
      }
    ]
  },

  // ✅ CONFIGURACIÓN DE COMPILACIÓN OPTIMIZADA
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ CONFIGURACIÓN EXPERIMENTAL CORREGIDA PARA NEXT.JS 15
  experimental: {
    // ✅ OPTIMIZACIONES BÁSICAS - SIN optimizeCss QUE CAUSA ERROR
    // optimizeCss: true, // REMOVIDO - causa error critters
    optimizeServerReact: true,
    
    // ✅ MEJORAR CARGA EN MÓVILES
    gzipSize: true,
  },

  // ✅ CONFIGURACIÓN DEL COMPILADOR PARA NEXT.JS 15
  compiler: {
    // ✅ REMOVER CONSOLE.LOG EN PRODUCCIÓN
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // ✅ CONFIGURACIÓN DE WEBPACK PARA MÓVILES
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // ✅ OPTIMIZACIONES PARA PERFORMANCE MÓVIL
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        
        // ✅ SPLIT CHUNKS OPTIMIZADO PARA MÓVILES
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            
            // ✅ CHUNK SEPARADO PARA VENDORS GRANDES
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              maxSize: 244000, // 244KB - Óptimo para móviles
            },
            
            // ✅ CHUNK PARA FIREBASE
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 20,
            },
            
            // ✅ CHUNK PARA ICONOS
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 15,
            }
          }
        }
      };
    }

    return config;
  },

  // ✅ CONFIGURACIÓN DE SALIDA OPTIMIZADA
  output: 'standalone',
  
  // ✅ CONFIGURACIÓN DE TRANSPILACIÓN
  transpilePackages: [
    // ✅ TRANSPILE PARA MEJOR COMPATIBILIDAD MÓVIL
    'lucide-react',
  ],

  // ✅ CONFIGURACIÓN DE COMPRESIÓN
  compress: true,

  // ✅ CONFIGURACIÓN DE DESARROLLO
  ...(process.env.NODE_ENV === 'development' && {
    // ✅ OPCIONES ESPECÍFICAS PARA DESARROLLO
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),

  // ✅ CONFIGURACIÓN PWA (PREPARACIÓN)
  async rewrites() {
    return [
      // ✅ REWRITE PARA SERVICE WORKER
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
      
      // ✅ REWRITE PARA MANIFEST
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      }
    ];
  },

  // ✅ CONFIGURACIÓN DE AMBIENTE
  env: {
    // ✅ VARIABLES PARA DETECCIÓN MÓVIL
    NEXT_PUBLIC_MOBILE_BREAKPOINT: '768',
    NEXT_PUBLIC_ENABLE_PWA: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },

  // ✅ CONFIGURACIÓN DE LOGGING
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig