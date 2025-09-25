// app/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import HomePageClient from './HomePageClient'; // Importamos el componente de cliente que crearemos a continuación

// METADATA ESPECÍFICA PARA LA PÁGINA DE INICIO
// Sobre-escribe la del layout para ser ultra-específica y relevante.
export const metadata: Metadata = {
  title: 'NORA AI: Tu Asistente de Inteligencia Artificial Personal',
  description: 'NORA es un revolucionario asistente de inteligencia artificial con GPT-4o y Gemini, diseñado para potenciar tu productividad y creatividad en todas tus plataformas.',
  alternates: {
    canonical: '/', // Define esta como la URL principal para la raíz del sitio.
  },
};

// SCHEMA MARKUP (JSON-LD) PARA LA APLICACIÓN DE SOFTWARE
// Esto le da a Google información estructurada para mostrar resultados enriquecidos.
const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA AI Assistant",
    "operatingSystem": "Windows, macOS, iOS, Android, Web",
    "applicationCategory": "ProductivityApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9", // ¡IMPORTANTE! Actualiza esto con tu calificación real.
      "reviewCount": "1250" // ¡IMPORTANTE! Actualiza con tu número de reseñas.
    },
    "offers": {
      "@type": "Offer",
      "price": "0", // Resalta que tienes una opción gratuita.
      "priceCurrency": "USD"
    },
    "description": "NORA es un revolucionario asistente de inteligencia artificial con GPT-4o y Gemini, diseñado para potenciar tu productividad y creatividad.",
    "url": "https://mynoraai.com",
    "screenshot": "https://mynoraai.com/images/screenshot-main.jpg" // ¡IMPORTANTE! Crea una captura de pantalla atractiva y súbela a `public/images/`.
};

// Este es el componente de página principal (Server Component).
// Su única función es inyectar el SEO y renderizar el componente de cliente.
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema para que se incluya en el HTML final. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        key="software-application-schema"
      />
      {/* Aquí renderizamos toda la parte visual e interactiva de la página. */}
      <HomePageClient />
    </>
  );
}