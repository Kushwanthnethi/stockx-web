import { MetadataRoute } from 'next'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://stocksx.info'

    // Static routes
    const routes = [
        '',
        '/explore',
        '/verdict',
        '/trending',
        '/news',
        '/notifications',
        '/login',
        '/signup',
    ].map((route) => {
        const isRoot = route === '';
        return {
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: isRoot ? 0.9 : 0.8,
        }
    })

    // TODO: Fetch top 100 stocks from API and add them here dynamically
    // const stocks = await fetch(API_URL).then(res => res.json())
    // const stockRoutes = stocks.map(...)

    return [...routes]
}
