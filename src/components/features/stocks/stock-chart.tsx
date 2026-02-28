"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { useSocket } from '@/providers/socket-provider';
import { useIsMobile } from '../../../hooks/use-mobile';

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

/* ─── Custom Tooltip ───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, isPositive }: any) {
    if (!active || !payload?.length) return null;
    const price = payload[0].value;
    const dateStr = label;
    const accentColor = isPositive ? '#22c55e' : '#ef4444';
    let formatted = '';
    try {
        formatted = format(new Date(dateStr), "MMMM do, yyyy hh:mm a");
    } catch {
        formatted = String(dateStr);
    }

    return (
        <div className={cn(
            "rounded-xl border p-3.5 shadow-xl min-w-[195px] backdrop-blur-xl",
            isPositive ? "border-emerald-500/20 shadow-emerald-500/10" : "border-red-500/20 shadow-red-500/10",
            "bg-popover/95 text-popover-foreground"
        )}>
            <div className="text-[10.5px] text-muted-foreground/80 mb-2 font-medium tracking-[0.3px]">
                {formatted}
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-[10.5px] text-muted-foreground/70 font-medium">Price</span>
                <span style={{ color: accentColor }} className="text-lg font-bold tracking-[-0.5px]">
                    ₹{(Number(price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );
}

/* ─── Custom Cursor (vertical crosshair) ───────────────────────── */
function CustomCursor({ points, height, isPositive }: any) {
    if (!points || !points.length) return null;
    const x = points[0].x;
    const accentColor = isPositive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
    return (
        <g>
            <line
                x1={x} y1={0} x2={x} y2={height}
                stroke={accentColor}
                strokeWidth={1}
                strokeDasharray="4 3"
            />
            {/* subtle glow at intersection */}
            <circle cx={x} cy={points[0].y} r={20} fill={isPositive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'} />
        </g>
    );
}

/* ─── Skeleton Loader ──────────────────────────────────────────── */
function ChartSkeleton() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500/50" />
                <div className="absolute inset-0 animate-ping">
                    <Loader2 className="h-8 w-8 text-emerald-500/20" />
                </div>
            </div>
            <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wider uppercase animate-pulse">
                Loading chart…
            </span>
        </div>
    );
}

/* ─── Main Component ───────────────────────────────────────────── */
export function StockChart({ symbol }: StockChartProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<Range>('1d');
    const [chartReady, setChartReady] = useState(false);
    const socket = useSocket();
    const prevRange = useRef<Range>('1d');
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setChartReady(false);
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history?range=${range}`);
                if (res.ok) {
                    const history = await res.json();

                    if (range === '1d' && history.length > 0) {
                        const lastDate = new Date(history[history.length - 1].date);
                        const lastDay = lastDate.getDate();
                        const lastMonth = lastDate.getMonth();
                        const lastYear = lastDate.getFullYear();

                        const filteredHistory = history.filter((d: ChartData) => {
                            const dDate = new Date(d.date);
                            return dDate.getDate() === lastDay &&
                                dDate.getMonth() === lastMonth &&
                                dDate.getFullYear() === lastYear;
                        });

                        // Final safety: Map to ensure strictly unique times and sort to monotonic
                        const uniqueMap = new Map();
                        for (const d of filteredHistory) {
                            uniqueMap.set(new Date(d.date).getTime(), d);
                        }
                        const finalHistory = Array.from(uniqueMap.values()).sort(
                            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                        );

                        setData(finalHistory);
                    } else {
                        const uniqueMap = new Map();
                        for (const d of history) {
                            uniqueMap.set(new Date(d.date).getTime(), d);
                        }
                        const finalHistory = Array.from(uniqueMap.values()).sort(
                            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                        );
                        setData(finalHistory);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            } finally {
                setLoading(false);
                // Stagger the chart-ready to allow a smooth entrance
                setTimeout(() => setChartReady(true), 50);
            }
        };

        fetchHistory();
        prevRange.current = range;
    }, [symbol, range]);

    useEffect(() => {
        if (!socket || (range !== '1d' && range !== '1w')) return;

        socket.emit('subscribeStock', symbol);

        const handlePriceUpdate = (update: PriceUpdate) => {
            if (update.symbol === symbol) {
                setData((prev) => {
                    const lastPoint = prev[prev.length - 1];
                    const now = new Date().toISOString();

                    if (lastPoint && new Date(now).getTime() - new Date(lastPoint.date).getTime() < 60000) {
                        return [...prev.slice(0, -1), { ...lastPoint, price: update.price }];
                    }
                    return [...prev, { date: now, price: update.price }];
                });
            }
        };

        socket.on('priceUpdate', handlePriceUpdate);

        return () => {
            socket.off('priceUpdate', handlePriceUpdate);
        };
    }, [socket, symbol, range]);

    /* ─── Derived state ────────────────────────────────────────── */
    const isPositive = useMemo(() => {
        if (data.length < 2) return true;
        return data[data.length - 1].price >= data[0].price;
    }, [data]);

    const periodChange = useMemo(() => {
        if (data.length < 2) return { value: 0, percent: 0 };
        const first = data[0].price;
        const last = data[data.length - 1].price;
        const value = last - first;
        const percent = first > 0 ? (value / first) * 100 : 0;
        return { value, percent };
    }, [data]);

    const accentColor = isPositive ? '#22c55e' : '#ef4444';
    const accentColorDim = isPositive ? 'rgba(34,197,94,' : 'rgba(239,68,68,';

    const formatXAxis = useCallback((tickItem: string) => {
        const date = new Date(tickItem);
        if (range === '1d') return format(date, 'HH:mm');
        if (range === '1w') return format(date, 'EEE');
        if (range === '1mo') return format(date, 'dd MMM');
        if (range === '3mo') return format(date, 'dd MMM');
        return format(date, 'MMM yy');
    }, [range]);

    /* Y-axis domain with breathing room */
    const yDomain = useMemo(() => {
        if (!data.length) return [0, 100];
        const prices = data.map(d => d.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const spread = max - min;
        // More padding on top so it never scrapes the ceiling of the container
        const paddingBottom = spread * 0.10 || max * 0.02;
        const paddingTop = spread * 0.20 || max * 0.05;
        return [Math.floor(min - paddingBottom), Math.ceil(max + paddingTop)];
    }, [data]);

    /* horizontal reference lines */
    const refLines = useMemo(() => {
        if (!data.length) return [];
        const [lo, hi] = yDomain;
        const r = hi - lo;
        const step = Math.ceil(r / 4 / 5) * 5 || 10;
        const lines: number[] = [];
        let v = Math.ceil(lo / step) * step;
        while (v <= hi) {
            lines.push(v);
            v += step;
        }
        return lines;
    }, [yDomain, data]);

    const formatYAxis = useCallback((value: number) => {
        if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
        if (value >= 10000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString('en-IN');
    }, []);

    /* gradient ID unique per symbol */
    const gradientId = `cg_${(symbol || '').replace(/[^a-zA-Z0-9]/g, '_')}`;

    const rangeLabels: Record<Range, string> = {
        '1d': '1D', '1w': '1W', '1mo': '1M', '3mo': '3M', '1y': '1Y'
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="flex items-start justify-between p-3 sm:p-4 pb-0 gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/90">
                        Price Performance
                    </h3>
                    {/* Period change badge */}
                    {!loading && data.length > 1 && (
                        <div className={cn(
                            "flex items-center gap-1 text-[11px] font-semibold",
                            isPositive ? "text-emerald-400" : "text-red-400"
                        )}>
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                                {isPositive ? '+' : ''}{periodChange.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                                isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}>
                                {isPositive ? '+' : ''}{periodChange.percent.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Period selector pills */}
                <div className="flex bg-muted/40 rounded-xl p-[3px] shrink-0 border border-border/40">
                    {(['1d', '1w', '1mo', '3mo', '1y'] as Range[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={cn(
                                "px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all duration-250 relative",
                                range === r
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground/70 hover:text-foreground/80"
                            )}
                        >
                            <span className="relative z-10">{rangeLabels[r]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Chart ──────────────────────────────────────── */}
            <div
                className={cn(
                    "flex-1 min-h-[300px] sm:min-h-0 px-0 sm:px-1 pb-1 sm:pb-2 transition-opacity duration-500 focus:outline-none focus-within:outline-none",
                    chartReady ? "opacity-100" : "opacity-0"
                )}
            >
                {loading ? (
                    <ChartSkeleton />
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" style={{ border: 'none', outline: 'none' }}>
                        <AreaChart
                            data={data}
                            margin={{ top: 16, right: isMobile ? 0 : 8, left: isMobile ? 0 : -4, bottom: isMobile ? 0 : -2 }}
                            style={{ border: 'none', outline: 'none' }}
                        >
                            <defs>
                                {/* Main fill gradient — dynamic color, softer fade */}
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
                                    <stop offset="40%" stopColor={accentColor} stopOpacity={0.10} />
                                    <stop offset="75%" stopColor={accentColor} stopOpacity={0.02} />
                                    <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            {/* Subtle horizontal reference lines */}
                            {refLines.map((val) => (
                                <ReferenceLine
                                    key={val}
                                    y={val}
                                    stroke="transparent"
                                />
                            ))}

                            {/* Opening price reference line  */}
                            {data.length > 0 && range === '1d' && (
                                <ReferenceLine
                                    y={data[0].price}
                                    stroke={`${accentColorDim}0.18)`}
                                    strokeDasharray="6 4"
                                    label={{
                                        value: `Open ₹${data[0].price.toLocaleString('en-IN')}`,
                                        position: 'right',
                                        style: { fontSize: '9px', fill: `hsl(var(--muted-foreground))`, opacity: 0.6, fontWeight: 600 }
                                    }}
                                />
                            )}

                            <XAxis
                                hide={isMobile}
                                dataKey="date"
                                tickFormatter={formatXAxis}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.6, fontWeight: 500 }}
                                minTickGap={45}
                                dy={6}
                            />
                            <YAxis
                                hide={isMobile}
                                domain={yDomain}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.6, fontWeight: 500 }}
                                tickFormatter={formatYAxis}
                                width={44}
                                dx={-2}
                            />
                            <Tooltip
                                content={<CustomTooltip isPositive={isPositive} />}
                                cursor={<CustomCursor isPositive={isPositive} />}
                                isAnimationActive={false}
                            />

                            {/* Main line + fill */}
                            <Area
                                type="linear"
                                dataKey="price"
                                stroke={accentColor}
                                strokeWidth={isMobile ? 1.5 : 2}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationDuration={1000}
                                animationEasing="ease-out"
                                activeDot={{
                                    r: 4.5,
                                    fill: accentColor,
                                    stroke: 'hsl(var(--background))',
                                    strokeWidth: 2,
                                    style: { filter: `drop-shadow(0 0 3px ${accentColorDim}0.3))` }
                                }}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/60 text-sm">
                        No chart data available
                    </div>
                )}
            </div>
            <style jsx global>{`
                .recharts-cartesian-axis-line, 
                .recharts-cartesian-grid-horizontal, 
                .recharts-cartesian-grid-vertical { 
                    stroke: none !important; 
                }
                .recharts-wrapper,
                .recharts-wrapper *,
                .recharts-surface,
                .recharts-container,
                .recharts-wrapper [role="application"],
                .recharts-wrapper [tabindex],
                .recharts-wrapper div,
                .recharts-wrapper svg {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                    user-select: none !important;
                }
                .recharts-wrapper:focus,
                .recharts-wrapper:active,
                .recharts-wrapper:focus-within,
                .recharts-wrapper:focus-visible,
                .recharts-wrapper *:focus,
                .recharts-wrapper *:active,
                .recharts-wrapper *:focus-within,
                .recharts-wrapper *:focus-visible,
                .recharts-surface:focus,
                .recharts-surface:active,
                .recharts-surface:focus-visible,
                svg:focus,
                svg:active,
                svg:focus-visible {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
}
