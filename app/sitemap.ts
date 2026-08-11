import type { MetadataRoute } from 'next'
import { articles } from '@/lib/articles'

const baseUrl = 'https://rahayi-blog.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...articleUrls
  ]
}