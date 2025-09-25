// app/faq/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import FaqPageClient from './FaqPageClient'; // Importamos el componente de cliente que crearemos

// METADATA ESPECÍFICA PARA LA PÁGINA DE PREGUNTAS FRECUENTES
// Optimizada para que los usuarios encuentren respuestas directas en Google.
export const metadata: Metadata = {
  title: 'Preguntas Frecuentes (FAQ) - NORA AI',
  description: 'Encuentra respuestas a las preguntas más comunes sobre NORA AI. Aprende sobre seguridad, funcionalidades, compatibilidad de dispositivos y más.',
  alternates: {
    canonical: '/faq', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP (JSON-LD) PARA LA PÁGINA DE FAQ
// Esto le da a Google la estructura exacta de tus preguntas para mostrarlas en los resultados.
const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is NORA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NORA is an advanced artificial intelligence assistant that uses GPT-4o and Gemini to provide accurate and natural responses to any question or task you have."
        }
      },
      {
        "@type": "Question",
        "name": "Is NORA free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NORA offers a free version with basic functionalities. We also have premium plans with advanced features for more demanding users."
        }
      },
      {
        "@type": "Question",
        "name": "What devices does it work on?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NORA is available on iPhone, iPad, Apple Watch, Mac, Android, and web browsers. Sync your conversations across all your devices."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to use NORA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NORA uses end-to-end encryption and does not store your personal conversations. Your privacy is our top priority."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use NORA offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NORA requires an internet connection to function, as it uses cloud-based AI models to provide the best possible responses."
        }
      },
      // ... Puedes añadir el resto de tus preguntas y respuestas aquí ...
    ]
};


// Componente de página principal para FAQ (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema específico para la página de FAQ. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        key="faq-page-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual e interactivo. */}
      <FaqPageClient />
    </>
  );
}