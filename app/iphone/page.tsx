// app/iphone/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import IphonePageClient from './IphonePageClient'; // Importamos el componente de cliente

// METADATA ESPECÍFICA PARA LA PÁGINA DE IPHONE
// Optimizada para keywords como "Asistente IA para iPhone", "NORA para iOS".
export const metadata: Metadata = {
  title: 'NORA para iPhone y iOS - Asistente de IA',
  description: 'Lleva el poder de NORA AI a tu iPhone. Descarga la app nativa para iOS y disfruta de un asistente de inteligencia artificial rápido, seguro y totalmente integrado.',
  alternates: {
    canonical: '/iphone', // URL canónica para esta página específica.
  },
};

// SCHEMA MARKUP PARA LA APLICACIÓN DE SOFTWARE (VERSIÓN IOS)
// Le dice a Google que esta página es sobre la versión de iOS de tu app.
const softwareApplicationSchema_iOS = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA for iPhone",
    "operatingSystem": "iOS",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9", // Calificación específica de la App Store
      "reviewCount": "850"   // Número de reseñas en la App Store
    },
    "url": "https://mynoraai.com/iphone",
};


// Componente de página principal para iPhone (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la app de iOS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema_iOS) }}
        key="software-application-ios-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <IphonePageClient />
    </>
  );
}