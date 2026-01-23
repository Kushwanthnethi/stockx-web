"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, User, Zap, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/providers/auth-provider";
import { DataTable } from "./data-table";

import { columns, MarketStock } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestorCard } from "@/components/features/investors/investor-card";
import { PortfolioTable } from "@/components/features/investors/portfolio-table";
import { CommandMenu } from "@/components/shared/command-menu";
import { isMarketOpen } from "@/lib/market-time";

export default function ExplorePage() {
    const [stocks, setStocks] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;
    const { user } = useAuth();
    const [isMarketActive, setIsMarketActive] = useState(false);

    // Investor State
    const [investors, setInvestors] = useState<any[]>([]);
    const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
    const [loadingInvestors, setLoadingInvestors] = useState(false);

    useEffect(() => {
        setIsMarketActive(isMarketOpen());
    }, []);

    useEffect(() => {
        const fetchMarket = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3333/stocks/market?page=${page}&limit=${PAGE_SIZE}`);
                if (res.ok) {
                    const data = await res.json();
                    setStocks(data);
                }
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarket();
    }, [page]);

    // Fetch Investors
    useEffect(() => {
        const fetchInvestors = async () => {
            setLoadingInvestors(true);
            try {
                const res = await fetch('http://localhost:3333/investors');
                if (res.ok) {
                    const data = await res.json();
                    setInvestors(data);
                    if (data.length > 0) {
                        setSelectedInvestor(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch investors", error);
            } finally {
                setLoadingInvestors(false);
            }
        };

        fetchInvestors();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-14 items-center justify-between px-4 max-w-6xl mx-auto">
                    <div className="font-bold text-xl tracking-tighter flex items-center gap-1">
                        <Link href="/" className="flex items-center gap-1">
                            <TrendingUp className="text-green-600" />
                            StockX
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block w-full max-w-sm">
                            <CommandMenu />
                        </div>
                        {user ? <UserNav /> : (
                            <Link href="/login">
                                <Button size="sm">Log In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <div className="lg:col-span-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">StockX Screener</h1>
                            <p className="text-muted-foreground mt-2">
                                Analyze top Indian stocks with deep fundamental metrics using real-time data.
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${isMarketActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                            {isMarketActive ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    LIVE MARKET
                                </>
                            ) : (
                                <>
                                    <Moon size={12} />
                                    MARKET CLOSED
                                </>
                            )}
                        </div>
                    </div>

                    <Tabs defaultValue="market" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="market">Market Screener</TabsTrigger>
                            <TabsTrigger value="investors">Investor Choice</TabsTrigger>
                        </TabsList>

                        <TabsContent value="market" className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-10 w-[250px] bg-muted rounded animate-pulse" />
                                    <div className="rounded-md border h-[400px] w-full bg-card animate-pulse" />
                                </div>
                            ) : (
                                <>
                                    <DataTable columns={columns} data={stocks} />
                                    <div className="flex items-center justify-end space-x-2 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium">
                                            Page {page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={stocks.length < PAGE_SIZE}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="investors">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Sidebar: List of Investors */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Famous Investors</h3>
                                    {loadingInvestors ? (
                                        <div className="space-y-2">
                                            <div className="h-24 bg-muted rounded animate-pulse" />
                                            <div className="h-24 bg-muted rounded animate-pulse" />
                                        </div>
                                    ) : (
                                        investors.map((inv) => (
                                            <InvestorCard
                                                key={inv.id}
                                                investor={inv}
                                                isSelected={selectedInvestor?.id === inv.id}
                                                onClick={() => setSelectedInvestor(inv)}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* Main Content: Portfolio */}
                                <div className="md:col-span-2 space-y-4">
                                    {selectedInvestor ? (
                                        <>
                                            <div>
                                                <h3 className="font-semibold text-xl flex items-center gap-2">
                                                    {selectedInvestor.name}'s Portfolio
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Tracked holdings and recent exits.
                                                </p>
                                            </div>
                                            <PortfolioTable stocks={selectedInvestor.stocks || []} />
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground border rounded-md min-h-[300px]">
                                            Select an investor to view details
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
