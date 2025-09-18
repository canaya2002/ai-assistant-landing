import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NORA - Tu Asistente de IA',
  description: 'NORA es un asistente de inteligencia artificial revolucionario desarrollado con GPT-4o & Gemini.',
  keywords: 'IA, asistente, inteligencia artificial, NORA, chat, GPT-4o, Gemini',
  authors: [{ name: 'NORA Team' }],
  openGraph: {
    title: 'NORA - Tu Asistente de IA',
    description: 'Asistente de IA revolucionario con análisis de pantalla, chat inteligente y más.',
    type: 'website',
    url: 'https://tu-dominio.com',
    images: [
      {
        url: 'https://tu-dominio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NORA - Tu Asistente de IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NORA - Tu Asistente de IA',
    description: 'Asistente de IA revolucionario con análisis de pantalla, chat inteligente y más.',
    images: ['https://tu-dominio.com/twitter-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
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
              success: {
                style: {
                  background: '#065f46',
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  background: '#7f1d1d',
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}