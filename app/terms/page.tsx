// app/terms/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import TermsPageClient from './TermsPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE TÉRMINOS DE SERVICIO
// Refuerza la autoridad y confianza de tu sitio.
export const metadata: Metadata = {
  title: 'Términos de Servicio - NORA AI',
  description: 'Lee los términos y condiciones para el uso de NORA AI. Este documento rige tu acceso y uso de nuestros servicios, software y sitio web.',
  alternates: {
    canonical: '/terms', // URL canónica para esta página.
  },
  robots: {
    index: true,
    follow: true,
  }
};

// SCHEMA MARKUP PARA PÁGINA DE TÉRMINOS DE SERVICIO
// Le dice a Google que esta página es un documento legal de Términos de Servicio.
const termsPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Términos de Servicio de NORA AI",
    "url": "https://mynoraai.com/terms",
    "mainEntity": {
        "@type": "CreativeWork",
        "name": "Términos de Servicio",
        "author": {
            "@type": "Organization",
            "name": "NORA AI"
        },
        "datePublished": "2025-08-26", // Fecha de publicación de los términos
        "description": "Condiciones legales para el uso del software y los servicios de NORA AI."
    }
};


// Componente de página principal para Términos (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la página de términos. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsPageSchema) }}
        key="terms-page-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <TermsPageClient />
    </>
  );
}