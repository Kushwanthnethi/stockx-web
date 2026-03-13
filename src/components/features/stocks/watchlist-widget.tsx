import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@/providers/auth-provider';
import { AreaChart, Area, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useLivePrice } from '@/hooks/use-live-price';
import { cn } from '@/lib/utils';

function WatchlistSparkline({ data, color, gradientId }: { data: number[]; color: string; gradientId: string }) {
    if (!data || data.length < 2) return <div className="w-[48px] h-[20px] sm:w-[56px] sm:h-[22px]" />;

    const chartData = data.map((v, i) => ({ v, i }));

    return (
        <div className="w-[48px] h-[20px] sm:w-[56px] sm:h-[22px] flex-shrink-0 justify-self-center">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <YAxis type="number" domain={["dataMin", "dataMax"]} hide />
                    <Area
                        type="linear"
                        dataKey="v"
                        stroke="none"
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false}
                    />
                    <Line
                        type="linear"
                        dataKey="v"
                        stroke={color}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        type="linear"
                        dataKey="v"
                        stroke="transparent"
                        dot={(props: any) => {
                            const isLast = props.index === chartData.length - 1;
                            if (!isLast) return <g />;
                            return <circle cx={props.cx} cy={props.cy} r={1.8} fill={color} />;
                        }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function CompactWatchlistPrice({ symbol, initialPrice, initialChangePercent }: { symbol: string; initialPrice: number; initialChangePercent: number }) {
    const { price, changePercent, flash } = useLivePrice({
        symbol,
        initialPrice,
        initialChangePercent,
    });

    const isPositive = (changePercent || 0) >= 0;
    return (
        <div className="text-right min-w-[88px] sm:min-w-[96px]">
            <div
                className={cn(
                    'text-[17px] sm:text-[18px] leading-none font-medium tabular-nums px-0.5 rounded transition-colors duration-300',
                    flash === 'up'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : flash === 'down'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                            : 'text-foreground',
                )}
            >
                ₹{(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={cn('mt-1 text-[12px] sm:text-[13px] leading-none font-semibold tabular-nums', isPositive ? 'text-green-500' : 'text-red-500')}>
                {isPositive ? '+' : ''}{Math.abs(changePercent || 0).toFixed(2)}%
            </div>
        </div>
    );
}

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

    if (loading) return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                    Your Watchlist
                    <span className="text-xs text-muted-foreground opacity-50">View All</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="grid grid-cols-[minmax(0,1fr)_48px_88px] sm:grid-cols-[minmax(0,1fr)_56px_96px] items-center gap-2 sm:gap-3">
                            <div className="flex min-w-0 flex-col space-y-1.5">
                                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-32 bg-muted animate-pulse rounded opacity-50" />
                            </div>
                            <div className="w-[48px] h-[20px] sm:w-[56px] sm:h-[22px] bg-muted animate-pulse rounded justify-self-center" />
                            <div className="flex flex-col items-end space-y-1.5">
                                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-10 bg-muted animate-pulse rounded opacity-50" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

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
                            const displaySymbol = stock.symbol.replace('.NS', '').replace('.BO', '');
                            const isPositive = stock.changePercent >= 0;
                            const sparkColor = isPositive ? '#22c55e' : '#ef4444';
                            const gradientId = `wl_${stock.symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
                            return (
                                <Link key={stock.symbol} href={`/stock/${stock.symbol}`} className="grid grid-cols-[minmax(0,1fr)_48px_88px] sm:grid-cols-[minmax(0,1fr)_56px_96px] items-center gap-2 sm:gap-3 group">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-[14px] sm:text-[15px] leading-none font-semibold group-hover:text-primary transition-colors">
                                            {displaySymbol}
                                        </span>
                                        <span className="text-[12px] text-muted-foreground leading-[1.1] break-words" title={stock.companyName}>
                                            {stock.companyName}
                                        </span>
                                    </div>
                                    <WatchlistSparkline
                                        data={stock.sparkline || []}
                                        color={sparkColor}
                                        gradientId={gradientId}
                                    />
                                    <CompactWatchlistPrice
                                            symbol={stock.symbol}
                                            initialPrice={stock.currentPrice || 0}
                                            initialChangePercent={stock.changePercent || 0}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
