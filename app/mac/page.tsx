// app/mac/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import MacOSPageClient from './MacOSPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE MACOS
// Optimizada para keywords como "Asistente IA para Mac", "NORA para macOS".
export const metadata: Metadata = {
  title: 'NORA para macOS - El Asistente de IA Nativo para tu Mac',
  description: 'Potencia tu productividad con NORA AI para Mac. La aplicación de escritorio definitiva con integración nativa en macOS, atajos y modo offline.',
  alternates: {
    canonical: '/mac', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP PARA LA APLICACIÓN DE SOFTWARE (VERSIÓN MACOS)
// Le dice a Google que esta página es sobre la versión de escritorio para Mac.
const softwareApplicationSchema_MacOS = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA for macOS",
    "operatingSystem": "macOS",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9", // ¡IMPORTANTE! Actualiza esto con tu calificación real.
      "reviewCount": "750"   // ¡IMPORTANTE! Actualiza con tu número de reseñas.
    },
    "url": "https://mynoraai.com/mac",
};


// Componente de página principal para macOS (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la app de macOS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema_MacOS) }}
        key="software-application-macos-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <MacOSPageClient />
    </>
  );
}