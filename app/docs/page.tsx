import { Metadata } from 'next';
import DocsClientComponent from './DocsClient';

// Metadata para SEO (Server Component)
export const metadata: Metadata = {
  title: 'Documentación Completa de NURO | Guía de Usuario Profesional',
  description: 'Documentación completa de NURO - Aprende a usar todas las funciones del asistente de IA más avanzado. Instalación, configuración, atajos de teclado, solución de problemas y API.',
  keywords: ['documentación NURO', 'guía usuario', 'tutorial IA', 'instalación', 'configuración', 'atajos teclado', 'API'],
  openGraph: {
    title: 'Documentación NURO - Guía Completa del Usuario',
    description: 'Todo lo que necesitas saber para dominar NURO y maximizar tu productividad con IA.',
    images: ['/images/docs-preview.jpg'],
    url: '/docs',
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentación NURO - Guía Completa',
    description: 'Todo lo que necesitas saber para dominar NURO y maximizar tu productividad con IA.',
    images: ['/images/docs-preview.jpg'],
  },
  alternates: {
    canonical: '/docs'
  }
};

// Server Component que renderiza el Client Component
export default function DocsPage() {
  return <DocsClientComponent />;
}