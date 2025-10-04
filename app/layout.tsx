// app/layout.tsx - VERSIÓN ACTUALIZADA PARA FIRESTORE (SIN ConversationProvider)

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | NORA AI',
    default: 'NORA AI: Tu Asistente de Inteligencia Artificial Personal',
  },
  description: 'Descubre NORA AI, el asistente de IA más avanzado con GPT-4o y Gemini. Disponible para escritorio y móvil, con análisis de pantalla, chat inteligente y privacidad total.',
  keywords: [
    'asistente IA', 'inteligencia artificial', 'NORA AI', 'asistente personal',
    'GPT-4o', 'Gemini', 'app de escritorio', 'asistente para Mac', 'asistente para Windows',
    'IA conversacional', 'productividad', 'automatización', 'chatbot inteligente'
  ],
  authors: [{ name: 'Carlos Anaya Ruiz', url: 'https://mynoraai.com' }],
  creator: 'Carlos Anaya Ruiz',
  publisher: 'NORA AI',
  openGraph: {
    title: 'NORA AI - El Futuro de la Asistencia Personal con IA',
    description: 'Experimenta la próxima generación de asistentes de IA con NORA. Potenciado por GPT-4o y Gemini para ofrecerte una experiencia inigualable.',
    type: 'website',
    url: 'https://mynoraai.com',
    siteName: 'NORA AI',
    images: [
      {
        url: 'https://mynoraai.com/og-image-nora.jpg',
        width: 1200,
        height: 630,
        alt: 'NORA AI Asistente de Inteligencia Artificial',
      },
    ],
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NORA AI - Tu Asistente de IA Personal Definitivo',
    description: 'NORA AI lleva la productividad al siguiente nivel con su potente motor de IA, disponible en todas tus plataformas.',
    images: ['https://mynoraai.com/twitter-image-nora.jpg'],
    creator: '@NoraAppAI',
  },
  metadataBase: new URL('https://mynoraai.com'),
  alternates: {
    canonical: '/',
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
  verification: {
    google: 'v191lcwldWmKWPXYVRR8VOahLhkYP5LjXjMkjZ43HpM',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
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