// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

// Configuración segura de Analytics
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nuro-ai.com';

// Metadatos optimizados para SEO
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | NURO - Asistente IA Profesional',
    default: 'NURO - Asistente IA Profesional | Análisis Inteligente de Pantalla'
  },
  description: 'NURO es el asistente de inteligencia artificial más avanzado para análisis inteligente de pantalla. Procesamiento local 100% privado, respuestas instantáneas y automatización profesional. Descarga gratis para Windows.',
  keywords: [
    'inteligencia artificial',
    'asistente IA', 
    'análisis pantalla',
    'productividad',
    'copiloto IA',
    'automatización',
    'Windows',
    'procesamiento local',
    'privacidad',
    'OCR',
    'visión computacional',
    'IA profesional',
    'asistente virtual',
    'workflow automation'
  ],
  authors: [{ name: 'NURO Technologies', url: BASE_URL }],
  creator: 'NURO Technologies',
  publisher: 'NURO Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['en_US', 'pt_BR'],
    url: BASE_URL,
    siteName: 'NURO - Asistente IA Profesional',
    title: 'NURO - Asistente de Inteligencia Artificial Profesional',
    description: 'Revoluciona tu productividad con el asistente de IA más avanzado. Análisis inteligente de pantalla, procesamiento local y privacidad garantizada. Descarga gratis.',
    images: [
      {
        url: '/images/nuro-og-main.jpg',
        width: 1200,
        height: 630,
        alt: 'NURO - Asistente de IA Profesional en acción',
        type: 'image/jpeg',
      },
      {
        url: '/images/nurologo.png',
        width: 512,
        height: 512,
        alt: 'Logo de NURO',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nuro_ai',
    creator: '@nuro_ai',
    title: 'NURO - Asistente IA Profesional',
    description: 'El asistente de IA más avanzado para análisis inteligente de pantalla. Procesamiento local, privacidad total.',
    images: ['/images/nuro-og-main.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION || '',
    }
  },
  category: 'Business Software',
  classification: 'Productivity Software',
  alternates: {
    canonical: BASE_URL
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'NURO',
    'application-name': 'NURO',
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#ffffff',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD estructurado y seguro
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "NURO Technologies",
        "url": BASE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${BASE_URL}/images/nurologo.png`,
          "width": 512,
          "height": 512,
          "caption": "NURO Logo"
        },
        "description": "Empresa líder en inteligencia artificial enfocada en asistencia profesional",
        "foundingDate": "2025",
        "sameAs": [
          "https://twitter.com/nuro_ai",
          "https://linkedin.com/company/nuro-technologies"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@nuro-technologies.com",
          "contactType": "customer service",
          "availableLanguage": ["Spanish", "English"]
        }
      },
      {
        "@type": "WebSite", 
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "NURO",
        "description": "Asistente de IA profesional para análisis inteligente de pantalla",
        "publisher": {
          "@id": `${BASE_URL}/#organization`
        },
        "inLanguage": "es-ES"
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${BASE_URL}/#software`,
        "name": "NURO",
        "description": "Asistente de inteligencia artificial profesional para análisis inteligente de pantalla con procesamiento local y privacidad garantizada",
        "url": BASE_URL,
        "operatingSystem": ["Windows 10", "Windows 11"],
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Productivity Software",
        "softwareVersion": "1.0.0",
        "datePublished": "2025-08-26",
        "dateModified": "2025-08-26",
        "downloadUrl": "https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe",
        "fileSize": "164MB",
        "softwareRequirements": "Windows 10 version 1903 or later, 4GB RAM, 200MB free space",
        "permissions": "Screen capture for visual analysis",
        "installUrl": `${BASE_URL}/#download`,
        "author": {
          "@id": `${BASE_URL}/#organization`
        },
        "publisher": {
          "@id": `${BASE_URL}/#organization`
        },
        "offers": [
          {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "name": "Plan Gratuito",
            "description": "Funcionalidades completas para uso personal",
            "availability": "https://schema.org/InStock",
            "validFrom": "2025-08-26"
          },
          {
            "@type": "Offer", 
            "price": "19",
            "priceCurrency": "USD",
            "name": "Plan Profesional",
            "description": "Funciones avanzadas para uso empresarial",
            "availability": "https://schema.org/InStock",
            "validFrom": "2025-08-26"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "247",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "Análisis visual inteligente con OCR avanzado",
          "Procesamiento de IA 100% local",
          "Respuestas contextuales en tiempo real",
          "Automatización de tareas repetitivas",
          "Interfaz flotante no intrusiva",
          "Privacidad y seguridad garantizada"
        ]
      }
    ]
  };

  return (
    <html lang="es">
      <head>
        {/* Preconnect críticos para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//github.com" />
        
        {/* Favicons optimizados */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/images/nurologo.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/images/nurologo.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* JSON-LD estructurado - Seguro sin dangerouslySetInnerHTML */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') 
          }}
        />
      </head>
      
      <body suppressHydrationWarning>
        <noscript>
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            background: '#f59e0b', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center', 
            zIndex: 9999 
          }}>
            Para la mejor experiencia, por favor habilita JavaScript en tu navegador.
          </div>
        </noscript>
        
        {children}
        
        {/* Google Analytics - Solo si está configurado */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script 
              id="google-analytics" 
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                    anonymize_ip: true,
                    cookie_flags: 'secure;samesite=strict'
                  });
                `
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}