"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";
import { useSocket } from "@/providers/socket-provider";

interface IndexData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

function MarqueeChip({ index }: { index: IndexData }) {
    const isPositive = index.changePercent >= 0;

    return (
        <div className="inline-flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg bg-card/60 backdrop-blur-sm border border-border/40 hover:border-border/80 transition-colors whitespace-nowrap select-none">
            {/* Symbol */}
            <span className="font-bold text-xs tracking-tight text-foreground">
                {index.symbol}
            </span>

            {/* Price */}
            <span className="font-semibold text-xs tabular-nums text-foreground/90">
                {index.price.toLocaleString(undefined, {
                    maximumFractionDigits: index.price > 10000 ? 0 : 2,
                    minimumFractionDigits: 0,
                })}
            </span>

            {/* Change % */}
            <span
                className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums",
                    isPositive ? "text-emerald-500" : "text-red-500"
                )}
            >
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isPositive ? "+" : ""}
                {index.changePercent.toFixed(2)}%
            </span>
        </div>
    );
}

export function MarqueeIndexTicker() {
    const [indices, setIndices] = useState<IndexData[]>([]);
    const [loading, setLoading] = useState(true);

    const socket = useSocket();

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/indices`);
                if (res.ok) {
                    const data = await res.json();
                    setIndices(data);
                }
            } catch (error) {
                console.error("Failed to fetch indices for marquee", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIndices();
    }, []);

    // WebSocket Integration for Zero Latency
    useEffect(() => {
        if (!socket || indices.length === 0) return;

        // Subscribe to each index symbol
        indices.forEach(idx => {
            socket.emit('subscribeStock', idx.symbol);
        });

        const handlePriceUpdate = (data: { symbol: string; price: number; change: number; changePercent: number }) => {
            setIndices(prev => prev.map(idx => {
                if (idx.symbol === data.symbol) {
                    // Update only if values actually changed to prevent unnecessary re-renders
                    if (idx.price === data.price && idx.changePercent === data.changePercent) return idx;
                    return {
                        ...idx,
                        price: data.price,
                        change: data.change,
                        changePercent: data.changePercent
                    };
                }
                return idx;
            }));
        };

        socket.on('priceUpdate', handlePriceUpdate);

        return () => {
            indices.forEach(idx => {
                socket.emit('unsubscribeStock', idx.symbol);
            });
            socket.off('priceUpdate', handlePriceUpdate);
        };
    }, [socket, indices.length === 0]); // Re-run once symbols are loaded

    if (loading) {
        return (
            <div className="w-full h-10 mb-3 rounded-lg bg-muted/30 animate-pulse" />
        );
    }

    if (indices.length === 0) return null;

    // We render 2 copies of the content for seamless looping
    const renderContent = () => (
        <>
            {indices.map((idx, i) => (
                <MarqueeChip key={`${idx.symbol}-${i}`} index={idx} />
            ))}
        </>
    );

    return (
        <div className="relative w-full overflow-hidden mb-4 group">
            {/* Gradient Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

            {/* Scrolling Track */}
            <div
                className="flex items-center py-1"
                style={{ width: "max-content" }}
            >
                <div className="marquee-track flex items-center group-hover:[animation-play-state:paused]">
                    {renderContent()}
                    {renderContent()}
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                .marquee-track {
                    animation: marquee-scroll 40s linear infinite;
                }

                @keyframes marquee-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
}
