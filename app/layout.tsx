// app/layout.tsx - VERSIÓN "SUPER SEO"
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

// METADATA GLOBAL - La base de tu SEO On-Page.
// Cada página heredará y podrá sobreescribir esta información.
export const metadata: Metadata = {
  // Título dinámico que se adapta a cada página. Mejora la relevancia.
  title: {
    template: '%s | NORA AI',
    default: 'NORA AI: Tu Asistente de Inteligencia Artificial Personal',
  },
  description: 'Descubre NORA AI, el asistente de IA más avanzado con GPT-4o y Gemini. Disponible para escritorio y móvil, con análisis de pantalla, chat inteligente y privacidad total.',
  // Keywords principales y secundarias para un posicionamiento amplio.
  keywords: [
    'asistente IA', 'inteligencia artificial', 'NORA AI', 'asistente personal',
    'GPT-4o', 'Gemini', 'app de escritorio', 'asistente para Mac', 'asistente para Windows',
    'IA conversacional', 'productividad', 'automatización', 'chatbot inteligente'
  ],
  // Información del autor y publicador para dar credibilidad.
  authors: [{ name: 'Carlos Anaya Ruiz', url: 'https://mynoraai.com' }],
  creator: 'Carlos Anaya Ruiz',
  publisher: 'NORA AI',

  // METADATOS PARA REDES SOCIALES (OPEN GRAPH Y TWITTER)
  // Asegura que tu sitio se vea increíble y profesional cuando se comparta.
  openGraph: {
    title: 'NORA AI - El Futuro de la Asistencia Personal con IA',
    description: 'Experimenta la próxima generación de asistentes de IA con NORA. Potenciado por GPT-4o y Gemini para ofrecerte una experiencia inigualable.',
    type: 'website',
    url: 'https://mynoraai.com',
    siteName: 'NORA AI',
    images: [
      {
        url: 'https://mynoraai.com/og-image-nora.jpg', // IMPORTANTE: Crea una imagen de 1200x630px y súbela a tu carpeta `public`.
        width: 1200,
        height: 630,
        alt: 'NORA AI Asistente de Inteligencia Artificial',
      },
    ],
    locale: 'es_MX', // Define el idioma principal de tu audiencia.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NORA AI - Tu Asistente de IA Personal Definitivo',
    description: 'NORA AI lleva la productividad al siguiente nivel con su potente motor de IA, disponible en todas tus plataformas.',
    images: ['https://mynoraai.com/twitter-image-nora.jpg'], // IMPORTANTE: Crea una imagen de 1200x675px y súbela a tu carpeta `public`.
    creator: '@NoraAppAI', // IMPORTANTE: Reemplaza con tu usuario de Twitter.
  },

  // METADATOS TÉCNICOS AVANZADOS
  metadataBase: new URL('https://mynoraai.com'),
  alternates: {
    canonical: '/', // URL canónica para la página principal.
  },
  // Directivas detalladas para los robots de búsqueda.
  robots: {
    index: true,
    follow: true,
    nocache: true, // Recomienda a Google re-cachear la página a menudo.
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Códigos de verificación para herramientas de webmaster.
  verification: {
    google: 'TU_GOOGLE_SITE_VERIFICATION_CODE', // IMPORTANTE: Reemplaza con tu código de Google Search Console.
  },
};

// VIEWPORT - Optimización para una experiencia móvil perfecta.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Previene el zoom no deseado.
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'dark light',
};

// COMPONENTE ROOT LAYOUT
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SCHEMA MARKUP (JSON-LD) - Datos estructurados para Google.
  // Esto le dice a Google quién es tu organización, ayudando a crear un Knowledge Panel.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NORA AI",
    "url": "https://mynoraai.com",
    "logo": "https://mynoraai.com/images/nora.png",
    "founder": {
      "@type": "Person",
      "name": "Carlos Anaya Ruiz"
    },
    // Enlaces a tus perfiles sociales para consolidar tu entidad.
    "sameAs": [
      "https://www.tiktok.com/@car2002121?is_from_webapp=1&sender_device=pc",
      "https://www.instagram.com/noraaiapp/",
      "https://www.facebook.com/profile.php?id=61576232000413&locale=es_LA",
      "https://www.linkedin.com/company/norappai/?viewAsMember=true"
    ]
  };

  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        {/* Pre-conexión a dominios clave para mejorar la velocidad de carga (LCP). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicons para todos los dispositivos y plataformas. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Inyección del Schema de Organización en el head. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ConversationProvider>
            {children}
          </ConversationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}