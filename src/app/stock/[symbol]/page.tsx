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
import { FinancialTable } from "@/components/features/stocks/financial-table";
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
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [symbol]);

    const { price, change, changePercent, flash } = useLivePrice({
        symbol: data ? data.symbol : symbol,
        initialPrice: data?.currentPrice || 0,
        initialChangePercent: data?.changePercent || 0
    });

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && !data ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-emerald-500" />
                        <p className="text-muted-foreground/80 font-medium tracking-wide text-sm">Loading market data...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-full">
                            <Activity className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="text-xl font-bold mb-2">Data Unavailable</div>
                            <p className="text-muted-foreground max-w-sm">{error}</p>
                        </div>
                        <Link href="/explore">
                            <Button variant="outline" className="mt-4">Back to Explore</Button>
                        </Link>
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* 1. Premium Header Section */}
                        <div className="flex flex-row items-start justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground truncate">
                                    {data.companyName}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono font-semibold text-[10px] md:text-xs border-primary/20 bg-primary/5 px-2 py-0.5 text-primary">
                                        {data.symbol}
                                    </Badge>
                                    <Badge variant="secondary" className="font-semibold text-[9px] md:text-[10px] tracking-wider uppercase bg-muted/50 text-muted-foreground">
                                        {data.exchange}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
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

                        <Tabs defaultValue="overview" className="space-y-8 w-full">
                            {/* Premium Sleek Tabs */}
                            <TabsList className="w-full justify-start h-auto p-1.5 bg-muted/40 rounded-2xl border border-border/40 inline-flex overflow-x-auto no-scrollbar">
                                <TabsTrigger value="overview" className="rounded-xl px-5 py-2 font-semibold text-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Overview</TabsTrigger>
                                <TabsTrigger value="results" className="rounded-xl px-5 py-2 font-semibold text-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Results</TabsTrigger>
                                <TabsTrigger value="news" className="rounded-xl px-5 py-2 font-semibold text-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">News</TabsTrigger>
                                <TabsTrigger value="community" className="rounded-xl px-5 py-2 font-semibold text-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Insights</TabsTrigger>
                            </TabsList>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
                                {/* 1. Chart Section - Direct render, no double boxing */}
                                <div className="h-[400px] sm:h-[480px] w-full mt-2">
                                    <StockChart symbol={data.symbol} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Performance & Fundamentals */}
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* Performance Section */}
                                        <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50">
                                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-emerald-500" />
                                                    Market Performance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-8 pt-6">
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
                                                    current={price}
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Fundamentals Overview */}
                                        <Card className="border-border/60 shadow-sm bg-card/50">
                                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-blue-500" />
                                                        Fundamentals Synopsis
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                                    <StatBox label="Market Cap" value={data.marketCap ? `₹${(data.marketCap / 1e7).toFixed(0)}Cr` : '-'} />
                                                    <StatBox label="P/E Ratio" value={data.peRatio?.toFixed(2)} />
                                                    <StatBox label="P/B Ratio" value={data.pbRatio?.toFixed(2)} />
                                                    <StatBox label="EPS" value={data.eps ? `₹${data.eps.toFixed(2)}` : '-'} />
                                                    <StatBox label="ROE" value={data.returnOnEquity ? `${(data.returnOnEquity * 100).toFixed(2)}%` : '-'} />
                                                    <StatBox label="ROCE" value={data.returnOnCapitalEmployed ? `${(data.returnOnCapitalEmployed * 100).toFixed(2)}%` : '-'} />
                                                    <StatBox label="Div Yield" value={data.dividendYield ? `${(data.dividendYield * 100).toFixed(2)}%` : '-'} />
                                                    <StatBox label="Book Val" value={data.bookValue?.toFixed(2)} />
                                                </div>
                                                <FundamentalsExpanded stock={data} />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right Column: Peers & Smart Money */}
                                    <div className="space-y-6">
                                        <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm bg-card/50">
                                            <PeerComparison symbol={data.symbol} currentStock={data} />
                                        </div>
                                        <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm bg-card/50">
                                            <SmartMoney stock={data} />
                                        </div>
                                    </div>
                                </div>

                                {/* About Company - Full Width */}
                                <Card className="border-border/60 shadow-sm bg-card/50 mt-8">
                                    <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                                        <CardTitle className="text-base font-bold">About {data.companyName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                                            {data.description ? data.description : `${data.companyName} is a publicly traded company listed on the ${data.exchange}. Track its real-time performance, key financial metrics, and community sentiment here on StockX.`}
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>


                            {/* RESULTS TAB */}
                            <TabsContent value="results" className="focus-visible:outline-none">
                                <QuarterlyResults symbol={symbol} />
                            </TabsContent>

                            {/* NEWS TAB */}
                            <TabsContent value="news" className="focus-visible:outline-none">
                                <StockNews symbol={data.symbol} />
                            </TabsContent>

                            {/* COMMUNITY TAB */}
                            <TabsContent value="community" className="focus-visible:outline-none flex justify-center">
                                <div className="w-full max-w-2xl">
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
        <div className="px-4 py-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-colors">
            <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">{label}</div>
            <div className="font-semibold text-foreground truncate text-sm sm:text-base">
                {value !== undefined && value !== null ? value : '-'}
            </div>
        </div>
    );
}
