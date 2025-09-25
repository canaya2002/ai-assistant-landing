// app/windows/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import WindowsPageClient from './WindowsPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE WINDOWS
// Optimizada para keywords como "Asistente IA para Windows", "NORA para PC".
export const metadata: Metadata = {
  title: 'NORA para Windows - Asistente de IA para tu PC',
  description: 'Descarga NORA AI para Windows y obtén un asistente de IA nativo en tu PC. Integración con la barra de tareas, diseño Fluent y máximo rendimiento.',
  alternates: {
    canonical: '/windows', // URL canónica para esta página específica.
  },
};

// SCHEMA MARKUP PARA LA APLICACIÓN DE SOFTWARE (VERSIÓN WINDOWS)
// Le dice a Google que esta página es sobre la versión de escritorio para Windows.
const softwareApplicationSchema_Windows = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA for Windows",
    "operatingSystem": "Windows",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8", // ¡IMPORTANTE! Actualiza esto con tu calificación real.
      "reviewCount": "1100"  // ¡IMPORTANTE! Actualiza con tu número de reseñas.
    },
    "url": "https://mynoraai.com/windows",
};


// Componente de página principal para Windows (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la app de Windows. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema_Windows) }}
        key="software-application-windows-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <WindowsPageClient />
    </>
  );
}