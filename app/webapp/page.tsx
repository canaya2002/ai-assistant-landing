// app/webapp/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import WebAppPageClient from './WebAppPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE LA WEB APP
// Optimizada para keywords como "NORA Web App", "Asistente IA online".
export const metadata: Metadata = {
  title: 'NORA Web App - Asistente de IA en tu Navegador',
  description: 'Accede a NORA AI directamente desde tu navegador. Sin instalaciones, con sincronización en la nube y toda la potencia de nuestra IA en cualquier dispositivo.',
  alternates: {
    canonical: '/webapp', // URL canónica para esta página específica.
  },
};

// SCHEMA MARKUP PARA LA APLICACIÓN DE SOFTWARE (VERSIÓN WEB)
// Le dice a Google que esta página es sobre una aplicación web funcional.
const softwareApplicationSchema_WebApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NORA Web App",
    "operatingSystem": "Web", // Especifica que corre en cualquier navegador.
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://mynoraai.com/webapp",
};


// Componente de página principal para la Web App (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la Web App. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema_WebApp) }}
        key="software-application-webapp-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <WebAppPageClient />
    </>
  );
}