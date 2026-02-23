"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isMarketOpen } from "@/lib/market-time";
import { API_BASE_URL } from "@/lib/config";
import { useLivePrice } from "@/hooks/use-live-price";
import { cn } from "@/lib/utils";

function TrendingRow({ stock }: { stock: any }) {
    const { price, changePercent, flash } = useLivePrice({
        symbol: stock.rawSymbol,
        initialPrice: stock.price,
        initialChangePercent: stock.change
    });

    return (
        <Link href={`/stock/${stock.symbol}`} className="flex items-center justify-between group">
            <div className="flex flex-col">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">${stock.symbol}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</span>
            </div>
            <div className="text-right">
                <div className={cn(
                    "text-sm font-medium tabular-nums transition-colors duration-300 px-1 rounded",
                    flash === "up" ? "bg-green-500/20 text-green-700 dark:text-green-400" : flash === "down" ? "bg-red-500/20 text-red-700 dark:text-red-400" : ""
                )}>₹{(price || 0).toFixed(2)}</div>
                <div className={`text-xs font-semibold ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 tabular-nums`}>
                    {changePercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
            </div>
        </Link>
    );
}

export function TrendingWidget() {
    const [trending, setTrending] = useState<any[]>([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/trending`);
                if (res.ok) {
                    const data = await res.json();
                    setTrending(data.map((stock: any) => ({
                        rawSymbol: stock.symbol,
                        symbol: stock.symbol.replace('.NS', ''), // Clean up symbol for display
                        name: stock.companyName,
                        price: stock.currentPrice,
                        change: stock.changePercent ? parseFloat(stock.changePercent.toFixed(2)) : 0
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch trending stocks", error);
            }
        };
        fetchTrending();
        const baseInterval = setInterval(fetchTrending, 60000);

        return () => {
            clearInterval(baseInterval);
        };
    }, []);

    return (
        <Card className="bg-card border-none shadow-none">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Market Movers
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-3">
                    {trending.map((stock) => (
                        <TrendingRow key={stock.rawSymbol} stock={stock} />
                    ))}
                </div>
                <Link href="/explore">
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary mt-2">
                        View All Stocks <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
