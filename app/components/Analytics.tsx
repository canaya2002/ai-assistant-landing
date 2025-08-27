// components/Analytics.tsx
'use client'

import Script from 'next/script'
import { GA_TRACKING_ID } from '../lib/gtag'

const Analytics = () => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

export default Analytics

// Agregar al layout.tsx:
// import Analytics from '../components/Analytics'
// 
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="es">
//       <body>
//         {children}
//         <Analytics />
//       </body>
//     </html>
//   )
// }