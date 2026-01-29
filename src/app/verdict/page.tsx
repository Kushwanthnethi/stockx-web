"use client";

import { useEffect, useState } from "react";
import { VerdictCard } from "@/components/features/stocks/verdict-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Layers, Landmark, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";
import { VerdictCriteria } from "@/components/features/stocks/verdict-criteria";

export default function VerdictPage() {
    const [verdicts, setVerdicts] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [aiStatus, setAiStatus] = useState<{
        isRefreshing: boolean;
        activeKeys: number;
        totalKeys: number;
        nextResetAt: number | null;
        queueLength?: number;
    } | null>(null);
    const [secondsToReset, setSecondsToReset] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        if (!aiStatus?.nextResetAt || aiStatus.activeKeys > 0) {
            setSecondsToReset(null);
            return;
        }

        const tick = () => {
            const diff = Math.ceil((aiStatus.nextResetAt! - Date.now()) / 1000);
            setSecondsToReset(diff > 0 ? diff : 0);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [aiStatus?.nextResetAt, aiStatus?.activeKeys]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (aiStatus?.isRefreshing || refreshing) {
            interval = setInterval(() => fetchVerdicts(), 5000);
        } else if (aiStatus && aiStatus.activeKeys === 0) {
            const pollRate = (secondsToReset && secondsToReset < 5) ? 5000 : 15000;
            interval = setInterval(() => fetchVerdicts(), pollRate);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [aiStatus?.isRefreshing, aiStatus?.activeKeys, refreshing, secondsToReset]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetch(`${API_BASE_URL}/stocks/verdicts/refresh-all`, { method: 'POST' });
        setTimeout(() => fetchVerdicts(), 2000);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    if (loading) {
        return (
            <div className="container py-12 space-y-12 min-h-screen">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-12 w-64 bg-primary/5" />
                    <Skeleton className="h-6 w-96 bg-primary/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[500px] rounded-2xl bg-primary/5" />
                    ))}
                </div>
            </div>
        );
    }

    const buyCount = verdicts.filter(v => (v.verdict?.verdict || v.institutional?.verdict) === 'BUY').length;
    const holdCount = verdicts.filter(v => (v.verdict?.verdict || v.institutional?.verdict) === 'HOLD').length;
    const sellCount = verdicts.filter(v => (v.verdict?.verdict || v.institutional?.verdict) === 'SELL').length;

    const visibleVerdicts = verdicts.slice(0, visibleCount);

    return (
        <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
            {/* Cinematic Background Glows - Multi-layered for Depth */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -translate-y-1/2 opacity-60 dark:opacity-40 pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[180px] translate-x-1/2 opacity-40 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -translate-x-1/2 translate-y-1/2 opacity-30 pointer-events-none" />

            <div className="max-w-[1400px] relative z-10 py-8 px-6 sm:px-10 space-y-8 animate-in fade-in duration-1000">
                {/* Header Section */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            The Verdict
                        </h1>
                        <p className="text-muted-foreground/80 max-w-2xl text-lg leading-relaxed">
                            <span className="text-primary font-semibold">Institutional Intelligence Code:</span> We translate complex market noise into clear, psychological signals. Answering the only question that matters: "If I were a long-term investor, what would I do now?"
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                            <input
                                type="text"
                                placeholder="Search Nifty 50 Verdicts..."
                                className="w-full bg-card/40 border border-border/40 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Prices (Delayed 15m)
                        </div>
                    </div>

                    {/* Criteria Legend */}
                    <VerdictCriteria />
                </div>

                {/* Content Grid - 3 columns as per image */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visibleVerdicts.map((item) => (
                        <VerdictCard key={item.symbol} stock={item} isThrottled={aiStatus?.activeKeys === 0} />
                    ))}
                </div>
            </div>

            {/* Load More Button */}
            {visibleCount < verdicts.length && (
                <div className="flex justify-center pt-8 pb-12">
                    <Button
                        onClick={loadMore}
                        variant="outline"
                        className="h-16 px-16 rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:shadow-primary/10 active:scale-95 group"
                    >
                        <span className="flex items-center gap-3">
                            Load More Intelligence
                            <TrendingUp size={16} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
                        </span>
                    </Button>
                </div>
            )}

            {verdicts.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                    <div className="h-32 w-32 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/20">
                        <Landmark className="text-primary opacity-50" size={60} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-black text-4xl italic tracking-tighter uppercase text-foreground">Dataset Vacuum</h3>
                        <p className="text-muted-foreground font-bold max-w-md mx-auto opacity-80 text-lg leading-relaxed">
                            No market intelligence found in the local cluster. Command the first synchronization cycle now.
                        </p>
                    </div>
                    <Button onClick={handleRefresh} className="rounded-2xl px-12 h-16 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-105 transition-transform">
                        Initialize Command
                    </Button>
                </div>
            )}
        </div>
    );
}
