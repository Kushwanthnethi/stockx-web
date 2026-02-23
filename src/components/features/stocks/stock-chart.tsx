"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { useSocket } from '@/providers/socket-provider';

interface StockChartProps {
    symbol: string;
}

type Range = '1d' | '1w' | '1mo' | '3mo' | '1y';

interface ChartData {
    date: string;
    price: number;
}

interface PriceUpdate {
    symbol: string;
    price: number;
}

export function StockChart({ symbol }: StockChartProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<Range>('1mo');
    const socket = useSocket();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history?range=${range}`);
                if (res.ok) {
                    const history = await res.json();
                    setData(history);
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [symbol, range]);

    useEffect(() => {
        if (!socket || (range !== '1d' && range !== '1w')) return;

        socket.emit('subscribeStock', symbol);

        const handlePriceUpdate = (update: PriceUpdate) => {
            if (update.symbol === symbol) {
                setData((prev) => {
                    const lastPoint = prev[prev.length - 1];
                    const now = new Date().toISOString();

                    // If the last point is very recent (less than 1 minute old), replace it
                    // Otherwise append a new point
                    if (lastPoint && new Date(now).getTime() - new Date(lastPoint.date).getTime() < 60000) {
                        return [...prev.slice(0, -1), { ...lastPoint, price: update.price }];
                    }
                    return [...prev, { date: now, price: update.price }];
                });
            }
        };

        socket.on('priceUpdate', handlePriceUpdate);

        return () => {
            // Only unsubscribe if we aren't using this symbol elsewhere (hooks do their own)
            socket.off('priceUpdate', handlePriceUpdate);
        };
    }, [socket, symbol, range]);

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        if (range === '1d') return format(date, 'HH:mm');
        if (range === '1w') return format(date, 'EEE HH:mm');
        if (range === '1mo') return format(date, 'dd MMM');
        if (range === '3mo') return format(date, 'dd MMM');
        return format(date, 'MMM yy');
    };

    return (
        <div className="w-full h-[400px] bg-card rounded-xl border border-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Price Performance</h3>
                <div className="flex bg-muted rounded-lg p-1">
                    {['1d', '1w', '1mo', '3mo', '1y'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r as Range)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxis}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                    backgroundColor: 'hsl(var(--background))',
                                    color: 'hsl(var(--foreground))',
                                    fill: 'hsl(var(--foreground))',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                labelFormatter={(label) => format(new Date(label), 'PPP p')}
                                formatter={(value: string | number | undefined) => [`₹${(Number(value) || 0).toFixed(2)}`, 'Price']}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No chart data available
                    </div>
                )}
            </div>
        </div>
    );
}
