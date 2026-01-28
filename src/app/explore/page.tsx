"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/providers/auth-provider";
import { DataTable } from "./data-table";
import { columns, MarketStock } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestorCard } from "@/components/features/investors/investor-card";
import { PortfolioTable } from "@/components/features/investors/portfolio-table";
import { isMarketOpen } from "@/lib/market-time";
import { API_BASE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
    const [stocks, setStocks] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 50;
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
                const res = await fetch(`${API_BASE_URL}/stocks/market?page=${page}&limit=${PAGE_SIZE}`);
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
                const res = await fetch(`${API_BASE_URL}/investors`);
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
        <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Ambient Background Effects - Visible in dark mode only */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container max-w-[1600px] mx-auto px-4 py-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <div className="lg:col-span-10 space-y-8">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm">
                                    <Sparkles size={12} />
                                    MARKET INTELLIGENCE
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                                Market Screener
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl font-light leading-relaxed">
                                Deep fundamental analysis of top Indian stocks powered by real-time metrics.
                            </p>
                        </div>

                        {/* Market Status Card */}
                        <div className="flex flex-col items-end gap-3">
                            <div className={cn(
                                "px-4 py-2 rounded-xl backdrop-blur-md border flex items-center gap-3 transition-all duration-300 shadow-sm",
                                isMarketActive
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-muted/50 border-border"
                            )}>
                                <div className="relative">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full",
                                        isMarketActive ? "bg-emerald-500" : "bg-muted-foreground"
                                    )} />
                                    {isMarketActive && (
                                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-widest uppercase",
                                        isMarketActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                    )}>
                                        Market Status
                                    </span>
                                    <span className={cn(
                                        "text-sm font-semibold",
                                        isMarketActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                    )}>
                                        {isMarketActive ? "LIVE & TRADING" : "CLOSED"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="market" className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <TabsList className="bg-muted border border-border p-1 h-auto rounded-xl inline-flex w-auto">
                                <TabsTrigger
                                    value="market"
                                    className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all duration-300"
                                >
                                    Stock Screener
                                </TabsTrigger>
                                <TabsTrigger
                                    value="investors"
                                    className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all duration-300"
                                >
                                    Investor Portfolios
                                </TabsTrigger>
                            </TabsList>
                        </motion.div>

                        <TabsContent value="market" className="space-y-4 focus-visible:outline-none">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-12 w-[300px] bg-muted rounded-lg animate-pulse" />
                                    <div className="rounded-xl border border-border h-[600px] w-full bg-card animate-pulse" />
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <DataTable columns={columns} data={stocks} />

                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-between py-6 px-1">
                                        <div className="text-sm text-muted-foreground">
                                            Showing page <span className="text-foreground font-medium">{page}</span> of market data
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={stocks.length < PAGE_SIZE}
                                                className="bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </TabsContent>

                        <TabsContent value="investors" className="focus-visible:outline-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            >
                                {/* Sidebar: List of Investors */}
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-xl text-foreground">Famous Investors</h3>
                                        <p className="text-muted-foreground text-sm">Select an investor to view their major holdings.</p>
                                    </div>
                                    <div className="space-y-3 pr-2 max-h-[800px] overflow-y-auto custom-scrollbar">
                                        {loadingInvestors ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <div key={i} className="h-24 bg-muted border border-border rounded-xl animate-pulse" />
                                            ))
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
                                </div>

                                {/* Main Content: Portfolio */}
                                <div className="md:col-span-2">
                                    <div className="bg-card border border-border rounded-2xl p-6 min-h-[600px] shadow-sm">
                                        {selectedInvestor ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b border-border pb-6">
                                                    <div>
                                                        <h3 className="font-bold text-2xl text-foreground flex items-center gap-2">
                                                            {selectedInvestor.name}
                                                        </h3>
                                                        <p className="text-primary font-medium mt-1">
                                                            Portfolio Analysis
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">Total Holdings</div>
                                                        <div className="text-xl font-bold text-foreground">{selectedInvestor.stocks?.length || 0}</div>
                                                    </div>
                                                </div>
                                                <PortfolioTable stocks={selectedInvestor.stocks || []} />
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                                    <User size={32} className="opacity-50" />
                                                </div>
                                                <p className="text-lg">Select an investor to analyze their portfolio</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
