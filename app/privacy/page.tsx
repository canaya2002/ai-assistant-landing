// app/privacy/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE POLÍTICA DE PRIVACIDAD
// Esencial para la confianza y el E-E-A-T (Experiencia, Expertise, Autoridad, Confianza).
export const metadata: Metadata = {
  title: 'Política de Privacidad - NORA AI',
  description: 'Conoce cómo NORA AI protege tu privacidad. Detallamos la información que recopilamos, cómo la usamos y tus derechos sobre tus datos. Tu seguridad es nuestra prioridad.',
  alternates: {
    canonical: '/privacy', // URL canónica para esta página.
  },
  robots: {
    index: true,
    follow: true, // Aseguramos que los motores de búsqueda sigan los enlaces de esta página.
  }
};

// SCHEMA MARKUP PARA PÁGINA DE POLÍTICA DE PRIVACIDAD
// Le dice a Google que esta página es un documento legal sobre privacidad.
const privacyPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Política de Privacidad de NORA AI",
    "url": "https://mynoraai.com/privacy",
    "mainEntity": {
        "@type": "CreativeWork",
        "name": "Política de Privacidad",
        "author": {
            "@type": "Organization",
            "name": "NORA AI"
        },
        "datePublished": "2025-08-26", // Fecha de publicación de la política
        "description": "Detalles sobre cómo NORA AI maneja y protege los datos de los usuarios."
    }
};


// Componente de página principal para Privacidad (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la página de privacidad. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPageSchema) }}
        key="privacy-page-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <PrivacyPageClient />
    </>
  );
}