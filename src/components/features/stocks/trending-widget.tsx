"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { useLivePrice } from "@/hooks/use-live-price";
import { cn } from "@/lib/utils";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────
interface MoverStock {
    symbol: string;
    companyName: string;
    currentPrice: number;
    changePercent: number;
    sparkline: number[];
}

interface MarketMoversData {
    gainers: MoverStock[];
    losers: MoverStock[];
    active: MoverStock[];
}

type TabKey = "gainers" | "losers" | "active";

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "gainers", label: "Gainers", icon: <TrendingUp size={12} /> },
    { key: "losers", label: "Losers", icon: <TrendingDown size={12} /> },
    { key: "active", label: "Active", icon: <Activity size={12} /> },
];

// ─── Sparkline Component ────────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return <div className="w-[56px] h-[24px]" />;

    const chartData = data.map((v, i) => ({ v, i }));
    const gradientId = `mv_${color.replace('#', '')}`;

    return (
        <div className="w-[72px] h-[28px] flex-shrink-0">
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

// ─── Stock Row ──────────────────────────────────────────────────────────
function MoverRow({ stock, tab }: { stock: MoverStock; tab: TabKey }) {
    const displaySymbol = stock.symbol.replace(".NS", "").replace(".BO", "");

    const { price, changePercent, flash } = useLivePrice({
        symbol: stock.symbol,
        initialPrice: stock.currentPrice,
        initialChangePercent: stock.changePercent,
    });

    const isPositive = changePercent >= 0;

    // Decide sparkline color based on tab context
    const sparkColor =
        tab === "gainers"
            ? "#22c55e"
            : tab === "losers"
                ? "#ef4444"
                : isPositive
                    ? "#22c55e"
                    : "#ef4444";

    return (
        <Link
            href={`/stock/${displaySymbol}`}
            className="flex items-center gap-2 group px-2 py-1.5 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
        >
            {/* Left: Symbol + Name */}
            <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    ${displaySymbol}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[110px] leading-tight">
                    {stock.companyName}
                </span>
            </div>

            {/* Center: Sparkline */}
            <MiniSparkline data={stock.sparkline} color={sparkColor} />

            {/* Right: Price + Change */}
            <div className="text-right flex-shrink-0 min-w-[72px]">
                <div
                    className={cn(
                        "text-sm font-medium tabular-nums transition-colors duration-300 px-1 rounded",
                        flash === "up"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : flash === "down"
                                ? "bg-red-500/20 text-red-700 dark:text-red-400"
                                : ""
                    )}
                >
                    ₹{(price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                    className={cn(
                        "text-xs font-semibold tabular-nums flex items-center justify-end gap-0.5",
                        isPositive ? "text-green-500" : "text-red-500"
                    )}
                >
                    {isPositive ? (
                        <TrendingUp size={10} />
                    ) : (
                        <TrendingDown size={10} />
                    )}
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                </div>
            </div>
        </Link>
    );
}

// ─── Main Widget ────────────────────────────────────────────────────────
export function TrendingWidget() {
    const [data, setData] = useState<MarketMoversData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("gainers");

    useEffect(() => {
        const fetchMovers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/market-movers`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch market movers", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMovers();
        const interval = setInterval(fetchMovers, 15000); // Refresh list every 15s (values are real-time via useLivePrice)
        return () => clearInterval(interval);
    }, []);

    const stocks = data?.[activeTab] ?? [];

    return (
        <Card className="bg-card border-none shadow-none">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Market Movers
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 space-y-3">
                {/* Tabs */}
                <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg">
                    {TAB_CONFIG.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200",
                                activeTab === key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2 py-0.5">
                                <div className="flex flex-col space-y-1.5 flex-1">
                                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded opacity-50" />
                                </div>
                                <div className="w-[72px] h-[28px] bg-muted animate-pulse rounded" />
                                <div className="flex flex-col items-end space-y-1.5 min-w-[72px]">
                                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-10 bg-muted animate-pulse rounded opacity-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : stocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No data available
                    </p>
                ) : (
                    <>
                        <div className="flex flex-col">
                            {stocks.map((stock) => (
                                <MoverRow
                                    key={stock.symbol}
                                    stock={stock}
                                    tab={activeTab}
                                />
                            ))}
                        </div>
                        <Link href="/explore">
                            <Button
                                variant="ghost"
                                className="w-full text-xs text-muted-foreground hover:text-primary mt-1"
                            >
                                View All Stocks{" "}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
