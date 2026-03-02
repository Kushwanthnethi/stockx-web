"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { VerdictCard } from "@/components/features/stocks/verdict-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Minus, TrendingDown, RefreshCw, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";
import { VerdictCriteria } from "@/components/features/stocks/verdict-criteria";
import { PremiumGuard } from "@/components/shared/premium-guard";
import { isMarketOpen } from "@/lib/market-time";

type FilterType = "ALL" | "BUY" | "HOLD" | "SELL";

export default function VerdictPage() {
    const [verdicts, setVerdicts] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(9);
    const [aiStatus, setAiStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
    const [isMarketActive, setIsMarketActive] = useState(false);

    useEffect(() => {
        setIsMarketActive(isMarketOpen());
    }, []);

    const fetchVerdicts = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/stocks/verdicts/nifty50`);
            if (!res.ok) throw new Error("Failed to fetch verdicts");
            const data = await res.json();

            if (data.stocks) {
                setVerdicts(data.stocks);
                setAiStatus(data.aiStatus);
            } else {
                setVerdicts(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVerdicts();
    }, []);

    // Poll every 10 seconds during active market, or 30s if refreshing AI
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isMarketActive || aiStatus?.isRefreshing) {
            const delay = (aiStatus?.isRefreshing && !isMarketActive) ? 30000 : 10000;
            interval = setInterval(() => fetchVerdicts(), delay);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [aiStatus?.isRefreshing, isMarketActive]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetch(`${API_BASE_URL}/stocks/verdicts/refresh-all`, { method: 'POST' });
        setTimeout(() => fetchVerdicts(), 2000);
    };

    // Compute counts
    const getVerdict = (v: any) => v.verdict?.verdict || v.institutional?.verdict || 'HOLD';
    const buyCount = verdicts.filter(v => getVerdict(v) === 'BUY').length;
    const holdCount = verdicts.filter(v => getVerdict(v) === 'HOLD').length;
    const sellCount = verdicts.filter(v => getVerdict(v) === 'SELL').length;

    // Filter + Search
    const filteredVerdicts = useMemo(() => {
        let result = verdicts;

        if (activeFilter !== "ALL") {
            result = result.filter(v => getVerdict(v) === activeFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(v =>
                v.symbol?.toLowerCase().includes(q) ||
                v.companyName?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [verdicts, activeFilter, searchQuery]);

    const visibleVerdicts = filteredVerdicts.slice(0, visibleCount);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground font-sans">
                <div className="relative z-10 w-full space-y-8 py-6 px-4 sm:px-6">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-6 w-40 rounded-full bg-primary/5" />
                        <Skeleton className="h-12 w-72 bg-primary/5" />
                        <Skeleton className="h-5 w-96 bg-primary/5" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-28 rounded-full bg-primary/5" />
                        <Skeleton className="h-9 w-28 rounded-full bg-primary/5" />
                        <Skeleton className="h-9 w-28 rounded-full bg-primary/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(9)].map((_, i) => (
                            <Skeleton key={i} className="h-[340px] rounded-xl bg-primary/5" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Ambient Background Effects — dark mode only, matching explore page */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 w-full space-y-8">
                <div className="space-y-8 py-2 px-2 sm:px-6">

                    {/* Header Section — matches explore page structure */}
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
                                    NIFTY 50 INTELLIGENCE
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                                The Verdict
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl font-light leading-relaxed">
                                AI-powered verdicts for India's top 50 stocks — blending technical, fundamental, and institutional signals.
                            </p>
                        </div>

                        {/* Market Status Card — same as explore page */}
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

                    {/* Filter Tabs + Search — with entrance animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => setActiveFilter("ALL")}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                    activeFilter === "ALL"
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-transparent text-muted-foreground border-border/50 hover:border-foreground/30"
                                )}
                            >
                                All ({verdicts.length})
                            </button>
                            <button
                                onClick={() => setActiveFilter("BUY")}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5",
                                    activeFilter === "BUY"
                                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
                                        : "bg-transparent text-muted-foreground border-border/50 hover:border-emerald-500/30 hover:text-emerald-500"
                                )}
                            >
                                <TrendingUp size={12} /> Buy ({buyCount})
                            </button>
                            <button
                                onClick={() => setActiveFilter("HOLD")}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5",
                                    activeFilter === "HOLD"
                                        ? "bg-amber-500/15 text-amber-500 border-amber-500/40"
                                        : "bg-transparent text-muted-foreground border-border/50 hover:border-amber-500/30 hover:text-amber-500"
                                )}
                            >
                                <Minus size={12} /> Hold ({holdCount})
                            </button>
                            <button
                                onClick={() => setActiveFilter("SELL")}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5",
                                    activeFilter === "SELL"
                                        ? "bg-rose-500/15 text-rose-500 border-rose-500/40"
                                        : "bg-transparent text-muted-foreground border-border/50 hover:border-rose-500/30 hover:text-rose-500"
                                )}
                            >
                                <TrendingDown size={12} /> Sell ({sellCount})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stocks..."
                                className="w-full bg-card/50 border border-border/40 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </motion.div>

                    {/* AI Status Bar */}
                    {aiStatus && (aiStatus.isRefreshing || aiStatus.isPreComputing) && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-xs"
                        >
                            <RefreshCw size={12} className="text-primary animate-spin" />
                            <span className="text-muted-foreground">
                                {aiStatus.isPreComputing
                                    ? `Pre-computing institutional data (${aiStatus.institutionalCacheSize || 0} stocks cached)...`
                                    : `Refreshing AI verdicts (${aiStatus.queueLength || 0} remaining)...`
                                }
                            </span>
                        </motion.div>
                    )}

                    {/* Criteria Legend */}
                    <VerdictCriteria />

                    <PremiumGuard>
                        {/* Cards Grid — with stagger animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {visibleVerdicts.map((item, index) => (
                                <motion.div
                                    key={item.symbol}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <VerdictCard stock={item} />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Empty state */}
                        {filteredVerdicts.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                            >
                                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                                    <BarChart3 className="text-muted-foreground/50" size={28} />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-semibold text-lg text-foreground">
                                        {searchQuery ? "No matching stocks" : "No verdicts available yet"}
                                    </h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        {searchQuery
                                            ? `No stocks match "${searchQuery}". Try a different search.`
                                            : "Verdicts are being generated. This usually takes a few minutes."
                                        }
                                    </p>
                                </div>
                                {!searchQuery && (
                                    <Button onClick={handleRefresh} variant="outline" size="sm" className="rounded-lg">
                                        <RefreshCw size={14} className="mr-2" /> Generate Verdicts
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {/* Load More */}
                        {visibleCount < filteredVerdicts.length && (
                            <div className="flex justify-center pt-6 pb-8">
                                <Button
                                    onClick={() => setVisibleCount(prev => prev + 9)}
                                    variant="outline"
                                    className="rounded-lg px-8 py-2 text-xs font-medium border-border/50 hover:bg-muted/30 transition-all"
                                >
                                    Load More ({filteredVerdicts.length - visibleCount} remaining)
                                </Button>
                            </div>
                        )}
                    </PremiumGuard>
                </div>
            </main>
        </div>
    );
}
