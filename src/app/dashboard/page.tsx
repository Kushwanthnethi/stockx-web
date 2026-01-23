"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StockBadge } from "@/components/shared/stock-badge";
import { Button } from "@/components/ui/button";
import { LiveStockTicker } from "@/components/features/stocks/live-stock-ticker";
import { API_BASE_URL } from "@/lib/config";

export default function DashboardPage() {
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

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
                    <Button asChild><Link href="/login">Login</Link></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />
            <main className="container max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <AppSidebar />

                <div className="lg:col-span-9 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Market Dashboard</h1>
                            <p className="text-muted-foreground">Track your favorite stocks and market movements.</p>
                        </div>
                    </div>

                    {/* Metrics Overview - Placeholder for now based on watchlist average */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Stocks Watched</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{watchlist.length}</div>
                            </CardContent>
                        </Card>
                        {/* More metrics can be calculated here */}
                    </div>

                    <div className="grid gap-4">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Your Watchlist</CardTitle>
                                <CardDescription>
                                    Real-time overview of your tracked assets.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                                    </div>
                                ) : watchlist.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">You are not watching any stocks yet.</p>
                                        <Button variant="link" asChild><Link href="/">Explore Stocks</Link></Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground border-b pb-2">
                                            <div className="col-span-4">Symbol</div>
                                            <div className="col-span-6 text-right">Price / Change</div>
                                            <div className="col-span-2 text-right">Action</div>
                                        </div>
                                        {watchlist.map((item) => {
                                            const stock = item.stock;
                                            const isPos = stock.changePercent >= 0;
                                            return (
                                                <div key={stock.symbol} className="grid grid-cols-12 items-center py-2 border-b last:border-0 hover:bg-muted/50 transition-colors rounded px-2">
                                                    <div className="col-span-4">
                                                        <div className="font-bold">{stock.symbol}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{stock.companyName}</div>
                                                    </div>
                                                    <div className="col-span-6 text-right flex justify-end">
                                                        <LiveStockTicker
                                                            symbol={stock.symbol}
                                                            initialPrice={stock.currentPrice}
                                                            initialChangePercent={stock.changePercent}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/stock/${stock.symbol}`}>View</Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
