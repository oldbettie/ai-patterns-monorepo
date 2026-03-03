import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://simplifiedqr.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      languages: {
        'ja-JP': baseUrl,
      },
    },
    {
      url: `${baseUrl}/generate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      languages: {
        'ja-JP': `${baseUrl}/generate`,
      },
    },
    {
      url: `${baseUrl}/wifi-qr-code`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      languages: {
        'ja-JP': `${baseUrl}/wifi-qr-code`,
      },
    },
    {
      url: `${baseUrl}/vcard-qr-code`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      languages: {
        'ja-JP': `${baseUrl}/vcard-qr-code`,
      },
    },
    {
      url: `${baseUrl}/alternatives/qr-tiger`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      languages: {
        'ja-JP': `${baseUrl}/alternatives/qr-tiger`,
      },
    },
    {
      url: `${baseUrl}/alternatives/qrcode-monkey`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      languages: {
        'ja-JP': `${baseUrl}/alternatives/qrcode-monkey`,
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
      languages: {
        'ja-JP': `${baseUrl}/privacy`,
      },
    },
  ]
}
