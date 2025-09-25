// app/about/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA "ACERCA DE"
// Optimizada para keywords como "sobre NORA AI", "equipo NORA", "misión de NORA".
export const metadata: Metadata = {
  title: 'Acerca de NORA AI - Nuestra Misión, Visión y Equipo',
  description: 'Conoce la historia detrás de NORA AI, nuestro equipo apasionado por la inteligencia artificial, nuestra misión de democratizar la IA y la tecnología que nos impulsa.',
  alternates: {
    canonical: '/about', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP (JSON-LD) PARA LA PÁGINA "ACERCA DE"
// Le dice a Google que esta página describe la organización, su historia y propósito.
const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
        "@type": "Organization",
        "name": "NORA AI",
        "url": "https://mynoraai.com",
        "description": "NORA was born from a simple yet powerful idea: to make advanced artificial intelligence accessible to everyone. We are a passionate team of engineers, designers, and AI ethicists dedicated to creating a digital assistant that is not only profoundly intelligent but also intuitive, secure, and genuinely helpful."
    },
    "url": "https://mynoraai.com/about",
    "name": "Acerca de NORA AI"
};

// Componente de página principal para "Acerca de" (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la página "Acerca de". */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
        key="about-page-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <AboutPageClient />
    </>
  );
}