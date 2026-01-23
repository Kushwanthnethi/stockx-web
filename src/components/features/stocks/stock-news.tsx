import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

interface StockNewsProps {
    symbol: string;
}

export function StockNews({ symbol }: StockNewsProps) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/news`);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                }
            } catch (e) {
                console.error("Failed to load stock news", e);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    if (loading) {
        return <div className="text-center py-10 text-muted-foreground animate-pulse">Loading latest news...</div>;
    }

    if (news.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No recent news found for {symbol}.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {news.map((item) => (
                <Card key={item.uuid} className="overflow-hidden hover:bg-accent/5 transition-colors group">
                    <CardContent className="p-4 sm:p-6 flex gap-4">
                        {/* Thumbnail if available */}
                        {item.thumbnail?.resolutions?.[0]?.url && (
                            <div className="flex-shrink-0 hidden sm:block">
                                <img
                                    src={item.thumbnail.resolutions[0].url}
                                    alt=""
                                    className="w-24 h-24 object-cover rounded-md bg-muted"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                <span className="font-semibold text-primary">{item.publisher}</span>
                                <span>•</span>
                                <span>{new Date(item.providerPublishTime).toLocaleDateString()}</span>
                            </div>

                            <Link href={item.link} target="_blank" className="block group-hover:underline">
                                <h3 className="text-base sm:text-lg font-semibold leading-tight mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                            </Link>

                            <div className="flex items-center gap-2 mt-3">
                                <BadgeList badges={item.relatedTickers?.filter((t: string) => t !== symbol) || []} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function BadgeList({ badges }: { badges: string[] }) {
    if (!badges.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {badges.slice(0, 3).map(ticker => (
                <span key={ticker} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                    {ticker}
                </span>
            ))}
            {badges.length > 3 && (
                <span className="text-xs text-muted-foreground">+{badges.length - 3}</span>
            )}
        </div>
    );
}
