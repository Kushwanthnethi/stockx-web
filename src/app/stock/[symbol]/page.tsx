"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WatchButton } from "@/components/features/stocks/watch-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LivePrice } from "@/components/features/stocks/live-price";
import { CommandMenu } from "@/components/shared/command-menu";
import { StockChart } from "@/components/features/stocks/stock-chart";
import { StockInsights } from "@/components/features/stocks/stock-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceRange } from "@/components/features/stocks/performance-range";

import { useLivePrice } from "@/hooks/use-live-price";
import { StockNews } from "@/components/features/stocks/stock-news";
import { FundamentalsExpanded } from "@/components/features/stocks/fundamentals-expanded";
import { PeerComparison } from "@/components/features/stocks/peer-comparison";
import { SmartMoney } from "@/components/features/stocks/smart-money";
import { QuarterlyResults } from "@/components/features/stocks/quarterly-results";
import { ManagementCommentary } from "@/components/features/stocks/management-commentary";
import { API_BASE_URL } from "@/lib/config";

export default function StockDetailsPage() {
    const params = useParams();
    const symbol = params.symbol as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!symbol) return;

        const fetchData = async () => {
            // Only show full loading spinner on first load
            if (!data) setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}`);
                if (!res.ok) {
                    const errorText = await res.text().catch(() => "Unknown error");
                    throw new Error(errorText || "Stock not found");
                }
                const text = await res.text();
                if (!text) throw new Error("Empty response from server");

                const stockData = JSON.parse(text);
                setData(stockData);
            } catch (err) {
                console.error(err);
                if (!data) setError("Could not load stock data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Poll every 10s to keep base data relatively fresh (less frequent now that we have simulation)
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [symbol]);

    // Use the hook to get simulated live updates
    // We default to data values if available, otherwise safe defaults to prevent crash
    const { price, change, changePercent, flash } = useLivePrice({
        initialPrice: data?.currentPrice || 0,
        initialChangePercent: data?.changePercent || 0
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-14 items-center justify-between px-4 max-w-6xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/explore">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-1">
                            StockX
                        </Link>
                    </div>
                    <div className="flex-1 max-w-md mx-4">
                        <CommandMenu />
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8">
                {loading && !data ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                        <p className="text-muted-foreground">Fetching market data for {symbol}...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="text-destructive font-bold mb-2">Error</div>
                        <p>{error}</p>
                        <Link href="/explore">
                            <Button variant="outline" className="mt-4">Go Back</Button>
                        </Link>
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* 1. Header Section */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.companyName}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="font-mono font-semibold text-sm">
                                        {data.symbol}
                                    </Badge>
                                    <span className="text-muted-foreground text-sm font-medium bg-muted/40 px-2 py-0.5 rounded">
                                        {data.exchange}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <LivePrice
                                        price={price}
                                        change={change}
                                        changePercent={changePercent}
                                        flash={flash}
                                    />
                                </div>
                                <WatchButton symbol={data.symbol} />
                            </div>
                        </div>


                        <Tabs defaultValue="overview" className="space-y-6">
                            <div className="border-b">
                                <TabsList className="h-10 w-full justify-start bg-transparent p-0">
                                    <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 pb-2 font-medium">Overview</TabsTrigger>
                                    <TabsTrigger value="results" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 pb-2 font-medium">Results</TabsTrigger>
                                    <TabsTrigger value="news" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 pb-2 font-medium">News</TabsTrigger>
                                    <TabsTrigger value="community" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 pb-2 font-medium">Community</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
                                {/* 1. Chart Section - Full Width */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="h-[450px] w-full">
                                            <StockChart symbol={data.symbol} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 2. Performance Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <PerformanceRange
                                            label="Today's Range"
                                            low={data.lowDay || Math.min(price, data.currentPrice * 0.98)}
                                            high={data.highDay || Math.max(price, data.currentPrice * 1.02)}
                                            current={price}
                                        />
                                        <PerformanceRange
                                            label="52W Range"
                                            low={data.low52Week}
                                            high={data.high52Week}
                                            // Ensure slider doesn't go OOB if simulation pushes it
                                            current={price}
                                        />
                                    </CardContent>
                                </Card>

                                {/* 3. Fundamentals Grid */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Fundamentals</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <StatBox label="Market Cap" value={`₹${(data.marketCap / 1e7).toFixed(0)}Cr`} />
                                        <StatBox label="P/E Ratio" value={data.peRatio?.toFixed(2)} />
                                        <StatBox label="P/B Ratio" value={data.pbRatio?.toFixed(2)} />
                                        <StatBox label="Div Yield" value={data.dividendYield ? `${(data.dividendYield * 100).toFixed(2)}%` : '-'} />
                                        <StatBox label="Book Value" value={data.bookValue?.toFixed(2)} />
                                        <StatBox label="ROE" value={data.returnOnEquity ? `${(data.returnOnEquity * 100).toFixed(2)}%` : '-'} />
                                        <StatBox label="EPS" value={data.eps ? data.eps.toFixed(2) : '-'} />
                                        <StatBox label="Debt" value={data.totalDebt ? `₹${(data.totalDebt / 1e7).toFixed(0)}Cr` : '-'} />
                                    </div>
                                    <FundamentalsExpanded stock={data} />
                                </div>

                                {/* Peer Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PeerComparison symbol={data.symbol} />
                                    <SmartMoney stock={data} />
                                </div>

                                {/* About Company */}
                                <div className="prose dark:prose-invert max-w-none pt-8 border-t">
                                    <h3 className="text-xl font-semibold mb-4">About {data.companyName}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                                        {data.description ? data.description : `${data.companyName} is a publicly traded company listed on the ${data.exchange}. Track its real-time performance, key financial metrics, and community sentiment here on StockX.`}
                                    </p>
                                </div>
                            </TabsContent>


                            {/* RESULTS TAB */}
                            <TabsContent value="results" className="space-y-6">
                                <QuarterlyResults symbol={data.symbol} />
                                <ManagementCommentary symbol={data.symbol} />
                            </TabsContent>

                            {/* NEWS TAB */}
                            <TabsContent value="news" className="space-y-4">
                                <StockNews symbol={data.symbol} />
                            </TabsContent>

                            {/* COMMUNITY TAB */}
                            <TabsContent value="community" className="space-y-4">
                                <div className="max-w-2xl">
                                    <StockInsights symbol={data.symbol} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : null}
            </main>
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string | number | undefined }) {
    return (
        <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className="font-semibold text-foreground truncate">
                {value !== undefined && value !== null ? value : '-'}
            </div>
        </div>
    );
}
