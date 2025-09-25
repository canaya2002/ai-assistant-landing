// app/pricing/page.tsx - VERSIÓN "SUPER SEO" (Componente de Servidor)

import type { Metadata } from 'next';
import PricingPageClient from './PricingPageClient'; // Importamos el componente de cliente

// METADATA ESPECÍFICA PARA LA PÁGINA DE PRECIOS
// Optimizada para keywords como "precios NORA AI", "planes NORA", "suscripción NORA".
export const metadata: Metadata = {
  title: 'Precios y Planes de NORA AI - Elige tu Plan',
  description: 'Descubre los planes de precios de NORA AI. Comienza gratis o elige un plan Pro o Pro Max para desbloquear funcionalidades avanzadas de inteligencia artificial.',
  alternates: {
    canonical: '/pricing', // URL canónica para esta página.
  },
};

// SCHEMA MARKUP PARA PRODUCTO CON OFERTAS
// Esto le dice a Google los detalles de tus planes, incluyendo precios.
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "NORA AI Subscription",
    "description": "Suscripciones para el asistente de inteligencia artificial NORA AI, con planes Free, Pro y Pro Max.",
    "brand": {
        "@type": "Brand",
        "name": "NORA AI"
    },
    "offers": [
        {
            "@type": "Offer",
            "name": "NORA Free",
            "price": "0.00",
            "priceCurrency": "USD",
            "description": "Plan gratuito con funcionalidades básicas."
        },
        {
            "@type": "Offer",
            "name": "NORA Pro",
            "price": "20.00",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "PriceSpecification",
                "price": "20.00",
                "priceCurrency": "USD",
                "valueAddedTaxIncluded": false,
                "billingIncrement": "P1M" // P1M = Per 1 Month
            },
            "description": "Plan Pro con funcionalidades avanzadas para usuarios profesionales."
        },
        {
            "@type": "Offer",
            "name": "NORA Pro Max",
            "price": "75.00",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "PriceSpecification",
                "price": "75.00",
                "priceCurrency": "USD",
                "valueAddedTaxIncluded": false,
                "billingIncrement": "P1M"
            },
            "description": "Plan Pro Max sin límites para equipos y empresas."
        }
    ]
};


// Componente de página principal para Precios (Server Component).
export default function Page() {
  return (
    <>
      {/* Inyección segura del Schema de Producto. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        key="product-pricing-schema"
      />
      {/* Renderizamos el componente de cliente con el contenido visual. */}
      <PricingPageClient />
    </>
  );
}