"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isMarketOpen } from "@/lib/market-time";

export function TrendingWidget() {
    const [trending, setTrending] = useState<any[]>([]);

    // ...

    useEffect(() => {
        const fetchTrending = async () => {
            // ... (same as before)
            try {
                const res = await fetch('http://localhost:3333/stocks/trending');
                if (res.ok) {
                    const data = await res.json();
                    setTrending(data.map((stock: any) => ({
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

        // Refresh base data every 60 seconds
        const baseInterval = setInterval(fetchTrending, 60000);

        let liveInterval: NodeJS.Timeout;

        if (isMarketOpen()) {
            // Simulate live ticker movement every 1 second
            liveInterval = setInterval(() => {
                setTrending(prev => prev.map(stock => {
                    // Random fluctuation between -0.05% and +0.05%
                    const volatility = 0.0005;
                    const changeFactor = 1 + (Math.random() * volatility * 2 - volatility);
                    const newPrice = stock.price * changeFactor;

                    // Update change % slightly based on new price vs (implied) open
                    const newChange = stock.change + (Math.random() * 0.02 - 0.01);

                    return {
                        ...stock,
                        price: newPrice,
                        change: parseFloat(newChange.toFixed(2))
                    };
                }));
            }, 1000);
        }

        return () => {
            clearInterval(baseInterval);
            if (liveInterval) clearInterval(liveInterval);
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
                        <Link href={`/stock/${stock.symbol}`} key={stock.symbol} className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">${stock.symbol}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium tabular-nums transition-colors duration-300">₹{stock.price.toFixed(2)}</div>
                                <div className={`text-xs font-semibold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 tabular-nums`}>
                                    {stock.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {stock.change > 0 ? '+' : ''}{stock.change}%
                                </div>
                            </div>
                        </Link>
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
