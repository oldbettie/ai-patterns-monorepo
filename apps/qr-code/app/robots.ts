import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://quickqr.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/profile/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
