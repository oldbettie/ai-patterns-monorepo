import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://simplifiedpdf.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { 'ja-JP': baseUrl } },
    },
    {
      url: `${baseUrl}/edit-pdf`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: { 'ja-JP': `${baseUrl}/edit-pdf` } },
    },
    {
      url: `${baseUrl}/sign-pdf`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: { 'ja-JP': `${baseUrl}/sign-pdf` } },
    },
    {
      url: `${baseUrl}/alternatives/adobe-acrobat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: { 'ja-JP': `${baseUrl}/alternatives/adobe-acrobat` } },
    },
    {
      url: `${baseUrl}/alternatives/smallpdf`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: { 'ja-JP': `${baseUrl}/alternatives/smallpdf` } },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
      alternates: { languages: { 'ja-JP': `${baseUrl}/privacy` } },
    },
  ]
}
