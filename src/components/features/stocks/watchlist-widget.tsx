import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@/providers/auth-provider';
import { LiveStockTicker } from './live-stock-ticker';

export function WatchlistWidget() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWatchlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchWatchlist = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/stocks/user/${user?.id}/watchlist`);
            if (res.ok) {
                const data = await res.json();
                setWatchlist(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    if (loading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                    Your Watchlist
                    <Link href="/dashboard" className="text-xs text-primary hover:underline font-normal">
                        View All
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {watchlist.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No stocks watched yet. Star some stocks to see them here!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {watchlist.slice(0, 5).map((item) => {
                            const stock = item.stock;
                            const isPositive = stock.changePercent >= 0;
                            return (
                                <Link key={stock.symbol} href={`/stock/${stock.symbol}`} className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="font-semibold group-hover:text-primary transition-colors">
                                            {stock.symbol}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                            {stock.companyName}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <LiveStockTicker
                                            symbol={stock.symbol}
                                            initialPrice={stock.currentPrice || 0}
                                            initialChangePercent={stock.changePercent || 0}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
