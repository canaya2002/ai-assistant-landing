// lib/gtag.ts
export const GA_TRACKING_ID = 'G-XXXXXXXXXX' // Reemplazar con tu ID real

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Eventos específicos para NURO
export const trackDownload = () => {
  event({
    action: 'download',
    category: 'engagement',
    label: 'nuro_download_v1.0.0'
  })
}

export const trackPriceView = (plan: string) => {
  event({
    action: 'view_pricing',
    category: 'engagement', 
    label: plan
  })
}

export const trackSectionView = (section: string) => {
  event({
    action: 'section_view',
    category: 'engagement',
    label: section
  })
}