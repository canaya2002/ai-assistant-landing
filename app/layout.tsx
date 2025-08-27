// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

// Google Analytics ID - REEMPLAZAR CON TU ID REAL
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nuro-ai.com'),
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
  authors: [{ name: 'NURO Technologies', url: 'https://nuro-ai.com' }],
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
    nocache: true,
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
    url: 'https://nuro-ai.com',
    siteName: 'NURO',
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
  category: 'Software',
  classification: 'Business Software',
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://nuro-ai.com/#organization",
        "name": "NURO Technologies",
        "url": "https://nuro-ai.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nuro-ai.com/images/nurologo.png",
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
          "telephone": "+1-555-NURO-AI1",
          "contactType": "customer service",
          "availableLanguage": ["Spanish", "English"]
        }
      },
      {
        "@type": "WebSite", 
        "@id": "https://nuro-ai.com/#website",
        "url": "https://nuro-ai.com",
        "name": "NURO",
        "description": "Asistente de IA profesional para análisis inteligente de pantalla",
        "publisher": {
          "@id": "https://nuro-ai.com/#organization"
        },
        "inLanguage": "es-ES",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://nuro-ai.com/faq?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://nuro-ai.com/#software",
        "name": "NURO",
        "description": "Asistente de inteligencia artificial profesional para análisis inteligente de pantalla con procesamiento local y privacidad garantizada",
        "url": "https://nuro-ai.com",
        "operatingSystem": ["Windows 10", "Windows 11"],
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Productivity Software",
        "softwareVersion": "1.0.0",
        "datePublished": "2025-08-26",
        "dateModified": "2025-08-26",
        "downloadUrl": "https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe",
        "fileSize": "164MB",
        "screenshot": "https://nuro-ai.com/images/nuro-screenshot.jpg",
        "softwareRequirements": "Windows 10 version 1903 or later, 4GB RAM, 200MB free space",
        "permissions": "Screen capture for visual analysis",
        "installUrl": "https://nuro-ai.com/#download",
        "author": {
          "@id": "https://nuro-ai.com/#organization"
        },
        "publisher": {
          "@id": "https://nuro-ai.com/#organization"
        },
        "offers": [
          {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "name": "Plan Gratuito",
            "description": "10 análisis por mes, IA básica, soporte comunitario",
            "availability": "https://schema.org/InStock",
            "validFrom": "2025-08-26"
          },
          {
            "@type": "Offer", 
            "price": "19",
            "priceCurrency": "USD",
            "name": "Plan Profesional",
            "description": "500 análisis por mes, IA avanzada, soporte 24/7",
            "availability": "https://schema.org/InStock",
            "validFrom": "2025-08-26",
            "priceValidUntil": "2025-12-31"
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
      },
      {
        "@type": "FAQPage",
        "@id": "https://nuro-ai.com/faq#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Por qué Windows dice que NURO es peligroso?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Windows Defender muestra esta advertencia porque NURO no está firmado digitalmente con un certificado de Microsoft. Esto es común en software independiente. NURO es completamente seguro y no contiene virus ni malware."
            }
          },
          {
            "@type": "Question", 
            "name": "¿Mis datos se envían a servidores externos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "¡NO! NURO procesa TODO localmente en tu dispositivo. Ni capturas de pantalla, ni texto, ni conversaciones se envían a internet. Los modelos de IA están instalados en tu computadora."
            }
          }
        ]
      }
    ]
  }

  return (
    <html lang="es">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/nurologo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/nurologo.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  )
}