"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, RefreshCw, Zap, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMarketSession, MarketSession, getMarketStatusText } from "@/lib/market-time";
import { API_BASE_URL } from "@/lib/config";

export function IndicesTicker() {
    const [indices, setIndices] = useState<any[]>([]);
    const [marketSession, setMarketSession] = useState<MarketSession>(MarketSession.CLOSED);
    const [statusText, setStatusText] = useState("");

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

        let liveInterval: NodeJS.Timeout;

        if (session === MarketSession.OPEN) {
            // Simulate live ticker movement ONLY if market is accurately OPEN (9:15-3:30)
            liveInterval = setInterval(() => {
                setIndices(prev => prev.map(index => {
                    const volatility = 0.0002; // Lower volatility for indices
                    const changeFactor = 1 + (Math.random() * volatility * 2 - volatility);

                    // We need to keep track of the original close or base price to calculate true change
                    // ensuring the math is consistent: change = price - prevClose
                    // For simulation, we can approximate prevClose from current state if not stored
                    const approximatePrevClose = index.price / (1 + (index.changePercent / 100));

                    const newPrice = index.price * changeFactor;
                    const newChange = newPrice - approximatePrevClose;
                    const newChangePercent = (newChange / approximatePrevClose) * 100;

                    return {
                        ...index,
                        price: newPrice,
                        change: newChange,
                        changePercent: newChangePercent
                    };
                }));
            }, 1000);
        }

        return () => {
            clearInterval(baseInterval);
            if (liveInterval) clearInterval(liveInterval);
        };
    }, []);

    if (indices.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Status Header */}
            <div className="flex items-center gap-2 mb-3 px-1 mt-2">
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

            {/* Desktop View: Grid of Cards */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
                {indices.map((index) => (
                    <Card key={index.symbol} className="bg-card border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg">{index.symbol}</h4>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    IN INDEX
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold tabular-nums">
                                    {index.price.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                </div>
                                <div className={cn(
                                    "text-sm font-semibold flex items-center justify-end gap-1 tabular-nums",
                                    index.change >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {index.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(index.change).toFixed(2)} ({index.changePercent.toFixed(2)}%)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Mobile View: High Density Grid */}
            <div className="md:hidden grid grid-cols-2 gap-2 px-1">
                {indices.map((index) => (
                    <div key={index.symbol} className="bg-card border-l-[3px] border-l-primary rounded-lg p-2.5 flex flex-col justify-between shadow-sm border border-border/50">
                        <div className="flex flex-col mb-1">
                            <span className="font-bold text-xs tracking-tight truncate leading-none mb-0.5">{index.symbol}</span>
                            <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider opacity-80">Index</div>
                        </div>
                        <div className="text-right">
                            <div className="text-base font-bold tabular-nums tracking-tighter leading-none">
                                {index.price.toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                            </div>
                            <div className={cn(
                                "text-[9px] font-bold flex items-center justify-end gap-0.5 tabular-nums mt-0.5 leading-none",
                                index.change >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {index.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {index.changePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
