// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mynoraai.com' // Tu dominio real
  const currentDate = new Date()

  const staticPages = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: 'weekly' },
    { url: `${baseUrl}/download`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: 'yearly' },
    { url: `${baseUrl}/pricing`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/versions`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: 'yearly' }
  ];

  const productPages = [
    { url: `${baseUrl}/iphone`, priority: 0.9, changeFrequency: 'quarterly' },
    { url: `${baseUrl}/android`, priority: 0.9, changeFrequency: 'quarterly' },
    { url: `${baseUrl}/mac`, priority: 0.9, changeFrequency: 'quarterly' },
    { url: `${baseUrl}/windows`, priority: 0.9, changeFrequency: 'quarterly' },
    { url: `${baseUrl}/webapp`, priority: 0.9, changeFrequency: 'quarterly' }
  ];

  return [
    ...staticPages.map(page => ({
      url: page.url,
      lastModified: currentDate,
      changeFrequency: page.changeFrequency as 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'daily' | 'never' | undefined,
      priority: page.priority,
    })),
    ...productPages.map(page => ({
        url: page.url,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency as 'quarterly' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'daily' | 'never' | undefined,
        priority: page.priority,
      })),
  ]
}