'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from '@/lib/config';

interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number; // Unix timestamp
}

export function NewsWidget() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/news`);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                console.error('Failed to fetch news', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNews();

        // Refresh every 2 minutes (120s)
        const interval = setInterval(fetchNews, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-card border-none shadow-none">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg text-foreground">Latest News</CardTitle>
                    {lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : news.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No news available.</p>
                ) : (
                    news.map((item) => (
                        <a
                            key={item.uuid}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group py-1 md:py-2 first:pt-0 border-b border-border/50 last:border-0"
                        >
                            <h4 className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary line-clamp-2 leading-snug mb-1">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                                <span className="font-semibold">{item.publisher}</span>
                                <span className="opacity-50">•</span>
                                <span>
                                    {(() => {
                                        if (!item.providerPublishTime) return '';
                                        try {
                                            const date = new Date(item.providerPublishTime * 1000);
                                            if (isNaN(date.getTime())) return '';
                                            return formatDistanceToNow(date, { addSuffix: true });
                                        } catch (e) {
                                            return '';
                                        }
                                    })()}
                                </span>
                            </div>
                        </a>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
