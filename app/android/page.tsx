// app/android/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import AndroidPageClient from './AndroidPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE ANDROID
// Optimizada para keywords como "Asistente IA para Android", "NORA para Android".
export const metadata: Metadata = {
  title: 'NORA para Android - Asistente de IA en Google Play',
  description: 'Descarga NORA AI para Android y transforma tu dispositivo en un potente asistente de IA. Integración nativa, widgets y diseño Material You.',
  alternates: {
    canonical: '/android', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP PARA LA APLICACIÓN DE SOFTWARE (VERSIÓN ANDROID)
// Le informa a Google que esta página trata sobre la versión de Android de tu app.
const softwareApplicationSchema_Android = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA for Android",
    "operatingSystem": "Android",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8", // ¡IMPORTANTE! Actualiza esto con tu calificación real de Google Play.
      "reviewCount": "920"   // ¡IMPORTANTE! Actualiza con tu número de reseñas.
    },
    "url": "https://mynoraai.com/android",
};


// Componente de página principal para Android (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la app de Android. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema_Android) }}
        key="software-application-android-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <AndroidPageClient />
    </>
  );
}