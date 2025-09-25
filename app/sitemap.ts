// app/sitemap.ts - VERSIÓN CORREGIDA Y OPTIMIZADA

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mynoraai.com'
  const currentDate = new Date()

  // Páginas estáticas con frecuencias válidas.
  const staticPages = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/download`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/pricing`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/versions`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: 'yearly' as const }
  ];

  // Páginas de producto con la frecuencia corregida de "quarterly" a "monthly".
  const productPages = [
    { url: `${baseUrl}/iphone`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/android`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/mac`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/windows`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/webapp`, priority: 0.9, changeFrequency: 'monthly' as const }
  ];

  const allPages = [...staticPages, ...productPages];

  return allPages.map((page) => ({
    url: page.url,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}