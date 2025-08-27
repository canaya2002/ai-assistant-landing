import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Configuración experimental para mejor performance
  experimental: {
    // Optimizaciones de renderizado
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    
    // Mejor tree shaking
    optimizeServerReact: true,
    
    // Instrumentación para monitoreo
    instrumentationHook: true,
    
    // Parallel routes para mejor UX
    parallelRoutes: true,
  },

  // Configuración de compilación
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuración de imágenes
  images: {
    // Dominios permitidos para next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nuro-ai.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/canaya2002/**',
      }
    ],
    
    // Formatos soportados (WebP, AVIF para mejor compresión)
    formats: ['image/webp', 'image/avif'],
    
    // Tamaños de imagen optimizados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Cache optimization
    minimumCacheTTL: 86400, // 24 horas
    
    // Configuración para mejor performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Seguridad básica
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'browsing-topics=()'
            ].join(', ')
          }
        ],
      },
      
      // Headers específicos para assets estáticos
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      
      // Headers para archivos estáticos
      {
        source: '/(favicon.ico|robots.txt|manifest.json)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          }
        ]
      }
    ];
  },

  // Redirects para mejor SEO
  async redirects() {
    return [
      // Redirect de URLs antiguas si las tienes
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/support',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/documentation',
        destination: '/docs',
        permanent: true,
      },
      
      // Redirects de URLs con trailing slash
      {
        source: '/docs/',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/faq/',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/changelog/',
        destination: '/changelog',
        permanent: true,
      },
    ];
  },

  // Rewrites para API y funcionalidades especiales
  async rewrites() {
    return [
      // Rewrite para sitemap.xml
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      
      // Analytics proxy (opcional, para mejor privacy)
      {
        source: '/analytics/:path*',
        destination: 'https://www.google-analytics.com/:path*',
      }
    ];
  },

  // Configuración de webpack para optimizaciones
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de producción
    if (!dev && !isServer) {
      // Bundle analyzer (solo en development si está habilitado)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      }

      // Optimización de chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 0,
            },
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 1,
            },
            lucide: {
              name: 'lucide',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 2,
            }
          }
        }
      };
    }

    // SVG como React componentes
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },

  // Configuración de output
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: false,
  
  // Configuración de desarrollo
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Configuración de TypeScript
  typescript: {
    // Tipos más estrictos en producción
    tsconfigPath: './tsconfig.json',
  },

  // ESLint configuration
  eslint: {
    // Solo ejecutar en build para desarrollo más rápido
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Configuración de server actions (si los usas)
  serverActions: {
    allowedOrigins: ['nuro-ai.com', 'localhost:3000'],
  },

  // Configuración para mejor SEO
  generateEtags: true,
  
  // Configuración de páginas estáticas
  async generateStaticParams() {
    return [
      { locale: 'es' },
      { locale: 'en' }
    ];
  }
};

export default nextConfig;