// app/versions/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import VersionsPageClient from './VersionsPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE VERSIONES
// Optimizada para keywords como "actualizaciones NORA AI", "changelog NORA", "novedades NORA".
export const metadata: Metadata = {
  title: 'Historial de Versiones (Changelog) - NORA AI',
  description: 'Mantente al día con las últimas actualizaciones y novedades de NORA AI. Descubre nuevas funciones, mejoras de rendimiento y correcciones en cada versión.',
  alternates: {
    canonical: '/versions', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP PARA PÁGINA WEB (TIPO CHANGELOG)
// Le indica a Google que esta página es un historial de cambios del software.
const changelogPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "NORA AI Changelog",
    "description": "Historial de versiones y actualizaciones del asistente de inteligencia artificial NORA AI.",
    "url": "https://mynoraai.com/versions",
    "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "NORA AI",
        "operatingSystem": "Windows, macOS, iOS, Android, Web"
    }
};


// Componente de página principal para Versiones (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la página de changelog. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(changelogPageSchema) }}
        key="changelog-page-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <VersionsPageClient />
    </>
  );
}