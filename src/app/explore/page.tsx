"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sparkles, TrendingUp, User } from "lucide-react";
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
        <div className="min-h-screen bg-[#0A0A0B] text-foreground font-sans selection:bg-indigo-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
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
                                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                    <Sparkles size={12} />
                                    MARKET INTELLIGENCE
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                Market Screener
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl font-light leading-relaxed">
                                Deep fundamental analysis of top Indian stocks powered by real-time metrics.
                            </p>
                        </div>

                        {/* Market Status Card */}
                        <div className="flex flex-col items-end gap-3">
                            <div className={cn(
                                "px-4 py-2 rounded-xl backdrop-blur-md border flex items-center gap-3 transition-all duration-300 shadow-lg",
                                isMarketActive
                                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5"
                                    : "bg-slate-800/40 border-slate-700/50"
                            )}>
                                <div className="relative">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full",
                                        isMarketActive ? "bg-emerald-500" : "bg-slate-500"
                                    )} />
                                    {isMarketActive && (
                                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-widest uppercase",
                                        isMarketActive ? "text-emerald-500" : "text-slate-500"
                                    )}>
                                        Market Status
                                    </span>
                                    <span className={cn(
                                        "text-sm font-semibold",
                                        isMarketActive ? "text-emerald-400" : "text-slate-400"
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
                            <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1 h-auto rounded-xl backdrop-blur-md inline-flex w-auto">
                                <TabsTrigger
                                    value="market"
                                    className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 transition-all duration-300"
                                >
                                    Stock Screener
                                </TabsTrigger>
                                <TabsTrigger
                                    value="investors"
                                    className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 transition-all duration-300"
                                >
                                    Investor Portfolios
                                </TabsTrigger>
                            </TabsList>
                        </motion.div>

                        <TabsContent value="market" className="space-y-4 focus-visible:outline-none">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-12 w-[300px] bg-slate-800/50 rounded-lg animate-pulse" />
                                    <div className="rounded-xl border border-slate-800/50 h-[600px] w-full bg-slate-900/30 animate-pulse backdrop-blur-xl" />
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
                                        <div className="text-sm text-slate-500">
                                            Showing page <span className="text-white font-medium">{page}</span> of market data
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={stocks.length < PAGE_SIZE}
                                                className="bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
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
                                        <h3 className="font-semibold text-xl text-white">Famous Investors</h3>
                                        <p className="text-slate-400 text-sm">Select an investor to view their major holdings.</p>
                                    </div>
                                    <div className="space-y-3 pr-2 max-h-[800px] overflow-y-auto custom-scrollbar">
                                        {loadingInvestors ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
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
                                    <div className="bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl rounded-2xl p-6 min-h-[600px]">
                                        {selectedInvestor ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                                                    <div>
                                                        <h3 className="font-bold text-2xl text-white flex items-center gap-2">
                                                            {selectedInvestor.name}
                                                        </h3>
                                                        <p className="text-indigo-400 font-medium mt-1">
                                                            Portfolio Analysis
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-slate-400">Total Holdings</div>
                                                        <div className="text-xl font-bold text-white">{selectedInvestor.stocks?.length || 0}</div>
                                                    </div>
                                                </div>
                                                <PortfolioTable stocks={selectedInvestor.stocks || []} />
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
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
