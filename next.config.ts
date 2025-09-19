import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ OPTIMIZACIONES BÁSICAS
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // ✅ CONFIGURACIÓN DE IMÁGENES  
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'images.unsplash.com',
      'cdn.openai.com',
      'oaidalleapiprodscus.blob.core.windows.net',
      'replicate.delivery',
      'pbxt.replicate.delivery'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ CONFIGURACIÓN WEBPACK PARA MÓVILES (CON TIPADO CORRECTO)
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // ✅ OPTIMIZACIÓN PARA VIDEOS EN MÓVILES
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },

  // ✅ HEADERS DE SEGURIDAD CORREGIDOS - PERMITIR MICRÓFONO
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
          
          // 🎤 PERMISOS CORREGIDOS - PERMITIR MICRÓFONO
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()'
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

  // ✅ CONFIGURACIÓN DE ENV OPTIMIZADA
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // ✅ CONFIGURACIÓN DE CACHÉ
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;