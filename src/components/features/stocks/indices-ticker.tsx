"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, RefreshCw, Zap, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMarketSession, MarketSession, getMarketStatusText } from "@/lib/market-time";
import { API_BASE_URL } from "@/lib/config";
import { useLivePrice } from "@/hooks/use-live-price";

interface IndexData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

function IndexCard({ index, className, size = "default" }: { index: IndexData, className?: string, size?: "default" | "small" }) {
    const { price, change, changePercent, flash } = useLivePrice({
        symbol: index.symbol,
        initialPrice: index.price,
        initialChangePercent: index.changePercent
    });

    if (size === "small") {
        return (
            <div className={cn(
                "bg-card border-l-[3px] border-l-primary rounded-lg p-2.5 flex flex-col justify-between shadow-sm border border-border/50 transition-all duration-300",
                flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : "",
                className
            )}>
                <div className="flex flex-col mb-1">
                    <span className="font-bold text-xs tracking-tight truncate leading-none mb-0.5">{index.symbol}</span>
                    <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider opacity-80">Index</div>
                </div>
                <div className="text-right">
                    <div className="text-base font-bold tabular-nums tracking-tighter leading-none">
                        {price.toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                    </div>

                    <div className={cn(
                        "text-[9px] font-bold flex items-center justify-end gap-0.5 tabular-nums mt-0.5 leading-none",
                        change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {changePercent.toFixed(2)}%
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className={cn(
            "bg-card border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300",
            flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : "",
            className
        )}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-lg">{index.symbol}</h4>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        IN INDEX
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold tabular-nums">
                        {price.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    </div>

                    <div className={cn(
                        "text-sm font-semibold flex items-center justify-end gap-1 tabular-nums",
                        change >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                        {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(change).toFixed(2)} ({changePercent.toFixed(2)}%)
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function IndicesTicker() {
    const [indices, setIndices] = useState<IndexData[]>([]);
    const [marketSession, setMarketSession] = useState<MarketSession>(MarketSession.CLOSED);
    const [statusText, setStatusText] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const session = getMarketSession();
        setMarketSession(session);
        setStatusText(getMarketStatusText());

        const fetchIndices = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/indices`);
                if (res.ok) {
                    const data = await res.json();
                    setIndices(data);
                }
            } catch (error) {
                console.error("Failed to fetch indices", error);
            }
        };

        fetchIndices();
        const baseInterval = setInterval(fetchIndices, 60000);

        return () => {
            clearInterval(baseInterval);
        };
    }, []);

    if (indices.length === 0) return null;

    // Separate primary and secondary indices
    // We assume NIFTY 50 and SENSEX are primary
    const primaryIndices = indices.filter(idx => {
        const sym = idx.symbol.toUpperCase();
        return sym === "NIFTY 50" || sym === "SENSEX";
    });
    const secondaryIndices = indices.filter(idx => {
        const sym = idx.symbol.toUpperCase();
        return sym !== "NIFTY 50" && sym !== "SENSEX";
    });

    return (
        <div className="mb-6">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-3 px-1 mt-2">
                <div className="flex items-center gap-2">
                    {marketSession === MarketSession.OPEN ? (
                        <>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                {statusText} <Zap size={14} className="text-yellow-500 fill-current" />
                            </h3>
                        </>
                    ) : marketSession === MarketSession.PRE_OPEN ? (
                        <>
                            <span className="relative flex h-3 w-3">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400 opacity-75"></span>
                            </span>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                {statusText} <span className="text-xs text-muted-foreground normal-case tracking-normal">(Price Discovery)</span>
                            </h3>
                        </>
                    ) : (
                        <>
                            <span className="relative flex h-3 w-3">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                            </span>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                {statusText} <Moon size={14} className="text-slate-400 fill-current" />
                            </h3>
                        </>
                    )}
                </div>

                {secondaryIndices.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                    >
                        {isExpanded ? (
                            <>Hide Details <ChevronUp size={14} /></>
                        ) : (
                            <>View More <ChevronDown size={14} /></>
                        )}
                    </button>
                )}
            </div>

            {/* Desktop View: Grid of Cards */}
            <div className="hidden md:flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    {primaryIndices.map((index) => (
                        <IndexCard key={index.symbol} index={index} />
                    ))}
                </div>

                {isExpanded && secondaryIndices.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        {secondaryIndices.map((index) => (
                            <IndexCard key={index.symbol} index={index} />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile View: High Density Grid */}
            <div className="md:hidden flex flex-col gap-2 px-1">
                <div className="grid grid-cols-2 gap-2">
                    {primaryIndices.map((index) => (
                        <IndexCard key={index.symbol} index={index} size="small" />
                    ))}
                </div>

                {isExpanded && secondaryIndices.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                        {secondaryIndices.map((index) => (
                            <IndexCard key={index.symbol} index={index} size="small" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
