"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, TrendingUp, TrendingDown, Minus, ShieldAlert, Target, Zap, Activity, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PremiumGuard } from "@/components/shared/premium-guard";
import { API_BASE_URL } from "@/lib/config";
import { useLivePrice } from "@/hooks/use-live-price";

interface AnalysisResult {
    symbol: string;
    quote: {
        regularMarketPrice: number;
        regularMarketChangePercent: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
    };
    technicals: {
        rsi: number;
        trend: string;
        macdHistogram: number;
        support: number;
        resistance: number;
        volumeShock?: string;
        ema20?: number;
        ema50?: number;
        ema200?: number;
    };
    fundamentals: {
        pe?: number;
        pb?: number;
        roe?: number;
        roa?: number;
        debtToEquity?: number;
        revenueGrowth?: number;
        earningsGrowth?: number;
        currentRatio?: number;
        targetHigh?: number;
        recommendationTrend?: any;
        sector?: string;
        industry?: string;
        insidersPercent?: number;
        institutionsPercent?: number;
    };
    news: any[];
    strategy: string;
    isFallback?: boolean;
}

export default function StrategistPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showInput, setShowInput] = useState(true);

    const liveData = useLivePrice({
        symbol: result?.symbol || "",
        initialPrice: result?.quote.regularMarketPrice || 0,
        initialChangePercent: result?.quote.regularMarketChangePercent || 0
    });

    useEffect(() => {
        // Enforce a cinematic static layout by preventing global scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResult(null); // Clear previous
        setShowInput(false); // Hide input immediately to focus on loading/result

        try {
            const res = await fetch(`${API_BASE_URL}/strategist/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            setQuery(""); // Clear input on success
        } catch (error: any) {
            toast.error(error.message || "Failed to analyze. Try again.");
            setShowInput(true); // Re-show input on error
        } finally {
            setLoading(false);
        }
    };

    const RsiBadge = ({ value }: { value: number }) => {
        let color = "bg-gray-500";
        let text = "Neutral";
        if (value > 70) { color = "bg-red-500"; text = "Overbought"; }
        else if (value < 30) { color = "bg-green-500"; text = "Oversold"; }

        return <Badge className={cn(color, "hover:" + color)}>{text} ({value?.toFixed(0)})</Badge>;
    };

    const TrendBadge = ({ trend }: { trend: string }) => {
        const isBull = trend === "BULLISH";
        return (
            <Badge variant={isBull ? "default" : "destructive"} className="gap-1">
                {isBull ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend}
            </Badge>
        );
    }

    return (
        <div className="relative flex flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100vh-5rem)] w-full overflow-hidden bg-white dark:bg-background text-slate-900 dark:text-slate-50 transition-colors duration-500">
            <PremiumGuard>
                {/* 1. Ultra-Premium Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Glowing Aura - Soft Amber/Slate */}
                    <div className="absolute -top-[5%] -left-[10%] w-[60%] h-[40%] md:w-[40%] md:h-[40%] bg-amber-500/10 dark:bg-amber-500/5 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-[5%] -right-[10%] w-[60%] h-[40%] md:w-[40%] md:h-[40%] bg-slate-500/10 dark:bg-slate-500/5 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

                    {/* Animated Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
                        style={{
                            backgroundImage: `linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }}
                    />
                </div>



                {/* 3. Main Dynamic Content - Isolated Scrolling Area */}
                <div className="flex-1 relative overflow-hidden">
                    <ScrollArea className="h-full z-10 scrollbar-hide" ref={scrollRef} type="hover">
                        <div className="max-w-7xl mx-auto px-0 lg:px-6 pb-96 lg:pb-56 pt-6 lg:pt-8">
                            {/* Integrated Header Area */}
                            <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={20} className="text-amber-500 lg:w-6 lg:h-6" />
                                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                            Market Strategist
                                        </h1>
                                    </div>
                                    {result && result.fundamentals?.sector && (
                                        <div className="flex flex-col items-end opacity-60">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{result.fundamentals.sector}</p>
                                            <p className="text-[8px] font-mono text-slate-400">{result.fundamentals.industry}</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-semibold ml-0.5 tracking-tight max-w-xl leading-relaxed">
                                    AI-Driven Strategic Alpha. Fusing technical indicators & fundamental charts for institutional-grade portfolio guidance.
                                </p>
                            </div>

                            <div className="space-y-8 lg:space-y-10">
                                {/* Empty State */}
                                {!result && !loading && showInput && (
                                    <div className="flex flex-col items-center justify-center min-h-[40vh] md:min-h-[40vh] animate-in fade-in zoom-in duration-1000 px-4 text-center">
                                        <div className="relative mb-4 md:mb-6 group inline-block">
                                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                            <div className="relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 backdrop-blur-2xl shadow-xl dark:shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:border-amber-500/20">
                                                <Target size={50} className="text-amber-500 dark:text-amber-400 transition-transform group-hover:rotate-12 md:w-[70px] md:h-[70px]" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tighter">Ready for Strategic Intel</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md text-sm md:text-base leading-relaxed font-semibold mx-auto">
                                            AI systems standing by. Input your holdings or queries to synthesize technical indicators and fundamental data into actionable insights.
                                        </p>
                                        <div className="mt-8 md:mt-12 group/ex p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.03] hover:border-amber-500/20 transition-all inline-block mx-auto">
                                            <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-slate-700 font-mono uppercase tracking-[0.2em] font-black group-hover/ex:text-amber-500 transition-colors">
                                                {`Example: "I bought 50 shares of SBIN at ₹600. Next move?"`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State - "Scanning Market" */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in duration-500">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            <div className="absolute inset-4 border-4 border-slate-500/20 rounded-full animate-ping" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles size={18} className="text-amber-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <p className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent animate-pulse tracking-tighter">
                                                Synthesizing Market Intelligence
                                            </p>
                                            <div className="relative h-1 w-48 bg-slate-900 rounded-full overflow-hidden ring-1 ring-white/5">
                                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-600 animate-[loading_2s_infinite]" style={{ width: '40%' }} />
                                            </div>
                                            <div className="flex flex-col items-center opacity-40">
                                                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                                                    Mapping Technical Fractals • fundamental health • News Sentiment
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Analysis Result */}
                                {result && (() => {
                                    const data = result;
                                    return (
                                        <>
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                                {/* Fallback Warning */}
                                                {data.isFallback && (
                                                    <div className="p-4 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl flex items-center gap-4">
                                                        <div className="p-2 bg-amber-500/20 rounded-full">
                                                            <ShieldAlert className="text-amber-500 w-5 h-5 lg:w-6 lg:h-6" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-amber-500 font-black text-sm lg:text-base tracking-tight">Fundamental Data Incomplete</p>
                                                            <p className="text-amber-500/60 font-semibold text-[10px] lg:text-xs">Yahoo Finance is currently under heavy load. AI is using an alternative data source for analysis.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Verdict Banner Card */}
                                                <div className="relative group">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-[2rem] blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-40 transition duration-1000" />
                                                    <Card className="relative bg-white/70 dark:bg-slate-950/60 border-black/[0.05] dark:border-white/5 backdrop-blur-[40px] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/[0.05] dark:ring-white/5">
                                                        <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] dark:opacity-[0.02]">
                                                            <TrendingUp size={200} className="text-amber-500" />
                                                        </div>
                                                        <CardHeader className="p-4 lg:p-8 relative z-10">
                                                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-3 lg:gap-4">
                                                                        <span className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-2xl">
                                                                            {data.symbol}
                                                                        </span>
                                                                        <Badge className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white border-black/10 dark:border-white/10 text-xs lg:text-base px-2 lg:px-3 py-0.5 lg:py-1 rounded-full backdrop-blur-xl font-bold">
                                                                            NSE
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2 lg:gap-3">
                                                                            <span className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                                                ₹{data.quote.regularMarketPrice.toLocaleString()}
                                                                            </span>
                                                                            <span className={cn(
                                                                                "text-xs lg:text-base font-black px-2 lg:px-3 py-0.5 rounded-[8px] lg:rounded-[10px] border",
                                                                                data.quote.regularMarketChangePercent >= 0
                                                                                    ? "text-emerald-500 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/5"
                                                                                    : "text-rose-500 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/10 bg-rose-500/5"
                                                                            )}>
                                                                                {data.quote.regularMarketChangePercent >= 0 ? "+" : ""}{data.quote.regularMarketChangePercent.toFixed(2)}%
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analysis Base (Delayed)</span>
                                                                        </div>

                                                                        {/* Zero Latency Live Pulse */}
                                                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-700 delay-300">
                                                                            <div className="relative flex h-2 w-2">
                                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                                            </div>
                                                                            <span className={cn(
                                                                                "text-[10px] lg:text-xs font-black tracking-widest uppercase transition-colors duration-300",
                                                                                liveData.flash === 'up' ? "text-emerald-500" : liveData.flash === 'down' ? "text-rose-500" : "text-amber-500/70"
                                                                            )}>
                                                                                Live Pulse: ₹{liveData.price.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                <div className="flex lg:flex-col gap-2 lg:gap-3 items-center lg:items-end w-full lg:w-auto">
                                                                    <div className="flex gap-2">
                                                                        {data.technicals.volumeShock === 'POSITIVE' && (
                                                                            <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20 gap-1">
                                                                                <Zap size={12} fill="currentColor" />
                                                                                Vol Shock
                                                                            </Badge>
                                                                        )}
                                                                        <TrendBadge trend={data.technicals.trend} />
                                                                    </div>
                                                                    <RsiBadge value={data.technicals.rsi} />
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-4 lg:p-8 pt-0 relative z-10">
                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-black/[0.05] dark:border-white/[0.03]">
                                                                {[
                                                                    { label: "Support", mobileLabel: "Support", value: `₹${data.technicals.support.toLocaleString()}`, color: "text-emerald-600 dark:text-emerald-400" },
                                                                    { label: "Resistance", mobileLabel: "Resist", value: `₹${data.technicals.resistance.toLocaleString()}`, color: "text-orange-600 dark:text-orange-400" },
                                                                    { label: "AI Momentum", mobileLabel: "Momentum", value: data.technicals.macdHistogram > 0 ? "BULL" : "BEAR", color: data.technicals.macdHistogram > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
                                                                    { label: "Confidence", mobileLabel: "Confid.", value: "HIGH", color: "text-amber-600 dark:text-amber-400" }
                                                                ].map((item, i) => (
                                                                    <div key={i} className="group/item relative p-3 lg:p-4 rounded-xl lg:rounded-[1.5rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all duration-500 hover:scale-[1.02]">
                                                                        <p className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] lg:tracking-[0.3em] text-slate-500 dark:text-slate-600 font-black mb-1 lg:mb-2">{item.label}</p>
                                                                        <p className={cn("text-base lg:text-xl font-black tracking-tight font-mono", item.color)}>{item.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Intelligence Deep Dive Section */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                                    {/* Fundamental Health Card */}
                                                    <div className="space-y-6">
                                                        <Card className="bg-white/40 dark:bg-slate-900/40 border-black/[0.05] dark:border-white/5 backdrop-blur-3xl rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-black/[0.05] dark:ring-white/5 font-semibold">
                                                            <CardHeader className="p-6">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Activity size={18} className="text-amber-500" />
                                                                    <CardTitle className="text-lg font-bold tracking-tight">Fundamental Vitality</CardTitle>
                                                                </div>
                                                                <CardDescription className="text-xs font-medium">Core financial health & valuation metrics</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="px-6 pb-6 space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {[
                                                                        { label: "P/E Ratio", value: data.fundamentals?.pe?.toFixed(2) || "N/A", color: "text-slate-900 dark:text-white" },
                                                                        { label: "P/B Ratio", value: data.fundamentals?.pb?.toFixed(2) || "N/A", color: "text-slate-900 dark:text-white" },
                                                                        { label: "ROE", value: data.fundamentals?.roe ? `${(data.fundamentals.roe * 100).toFixed(2)}%` : "N/A", color: "text-emerald-500" },
                                                                        { label: "Revenue Growth", value: data.fundamentals?.revenueGrowth ? `${(data.fundamentals.revenueGrowth * 100).toFixed(2)}%` : "N/A", color: "text-amber-500" },
                                                                        { label: "Debt/Equity", value: data.fundamentals?.debtToEquity?.toFixed(2) || "N/A", color: "text-slate-900 dark:text-white" },
                                                                        { label: "Current Ratio", value: data.fundamentals?.currentRatio?.toFixed(2) || "N/A", color: "text-slate-900 dark:text-white" }
                                                                    ].map((stat, i) => (
                                                                        <div key={i} className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03]">
                                                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{stat.label}</p>
                                                                            <p className={cn("text-sm lg:text-base font-black tracking-tight", stat.color)}>{stat.value}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {(data.fundamentals?.insidersPercent || data.fundamentals?.institutionsPercent) && (
                                                            <Card className="bg-white/20 dark:bg-slate-950/40 border-black/5 dark:border-white/5 backdrop-blur-2xl rounded-[1.5rem] p-6 shadow-xl">
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <ShieldAlert size={18} className="text-indigo-500" />
                                                                    <h3 className="font-bold text-sm tracking-tight">Institutional Footprint</h3>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                                                            <span>Institutions</span>
                                                                            <span>{(data.fundamentals.institutionsPercent! * 100).toFixed(1)}%</span>
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-indigo-500" style={{ width: `${(data.fundamentals.institutionsPercent! * 100)}%` }} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                                                            <span>Insiders / Promoters</span>
                                                                            <span>{(data.fundamentals.insidersPercent! * 100).toFixed(1)}%</span>
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-emerald-500" style={{ width: `${(data.fundamentals.insidersPercent! * 100)}%` }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        )}
                                                    </div>

                                                    {/* Strategic News & Sentiment */}
                                                    <div className="space-y-6">
                                                        {/* Brokerage Sentiment Card */}
                                                        {data.fundamentals?.recommendationTrend && (
                                                            <Card className="bg-gradient-to-br from-amber-500/5 to-orange-600/5 border-amber-500/10 backdrop-blur-3xl rounded-[1.5rem] p-6 shadow-lg ring-1 ring-amber-500/10">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <ShieldAlert size={18} className="text-amber-500" />
                                                                            <h3 className="font-bold text-slate-800 dark:text-white">Institutional Pulse</h3>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 font-medium">Global brokerage consensus</p>
                                                                    </div>
                                                                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                                                        {data.fundamentals.recommendationTrend.strongBuy + data.fundamentals.recommendationTrend.buy > 10 ? "HEAVILY TRADED" : "SELECTIVE"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="mt-4 grid grid-cols-3 gap-2">
                                                                    <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                                                                        <p className="text-[9px] uppercase font-black text-emerald-600 mb-0.5">Buy</p>
                                                                        <p className="font-black text-emerald-600">{data.fundamentals.recommendationTrend.buy + data.fundamentals.recommendationTrend.strongBuy}</p>
                                                                    </div>
                                                                    <div className="text-center p-2 rounded-lg bg-slate-500/10">
                                                                        <p className="text-[9px] uppercase font-black text-slate-500 mb-0.5">Hold</p>
                                                                        <p className="font-black text-slate-600 dark:text-slate-400">{data.fundamentals.recommendationTrend.hold}</p>
                                                                    </div>
                                                                    <div className="text-center p-2 rounded-lg bg-rose-500/10">
                                                                        <p className="text-[9px] uppercase font-black text-rose-600 mb-0.5">Sell</p>
                                                                        <p className="font-black text-rose-600">{data.fundamentals.recommendationTrend.sell + data.fundamentals.recommendationTrend.strongSell}</p>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        )}

                                                        {/* News Card */}
                                                        <Card className="bg-white/40 dark:bg-slate-900/40 border-black/[0.05] dark:border-white/5 backdrop-blur-3xl rounded-[1.5rem] overflow-hidden shadow-xl ring-1 ring-black/[0.05] dark:ring-white/5 flex-1">
                                                            <CardHeader className="p-6 pb-2">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Zap size={18} className="text-amber-500" />
                                                                    <CardTitle className="text-lg font-bold tracking-tight">Market Catalysts</CardTitle>
                                                                </div>
                                                                <CardDescription className="text-xs font-medium">Recent headlines influencing price action</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-4 space-y-3">
                                                                {data.news && data.news.length > 0 ? (
                                                                    data.news.slice(0, 3).map((item: { title: string; link: string }, i: number) => (
                                                                        <a
                                                                            key={i}
                                                                            href={item.link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group block p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-black/[0.05] dark:hover:border-white/[0.05] cursor-pointer"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <p className="text-[10px] font-mono text-amber-500 opacity-60">CATALYST {i + 1}</p>
                                                                                <ExternalLink size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            </div>
                                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">
                                                                                {item.title}
                                                                            </p>
                                                                        </a>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-xs text-slate-500 font-medium p-4 text-center italic">No high-impact catalysts found in last 24h.</p>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>

                                                {/* Detailed Strategy Markdown */}
                                                <Card className="bg-white/50 dark:bg-slate-900/20 border-black/[0.05] dark:border-white/[0.03] backdrop-blur-xl rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl relative">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                                                    <CardContent className="p-4 lg:p-12 pb-12 prose prose-slate dark:prose-invert prose-amber max-w-none">
                                                        <ReactMarkdown
                                                            components={{
                                                                h1: ({ ...props }) => <h1 className="text-xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-6 lg:mb-8 border-l-4 border-amber-500 pl-4 lg:pl-6 drop-shadow-md" {...props} />,
                                                                h2: ({ ...props }) => <h2 className="text-lg lg:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 lg:mt-12 mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4 before:content-[''] before:w-1.5 lg:before:w-2 before:h-6 lg:before:h-8 before:bg-gradient-to-b before:from-amber-400 before:to-orange-600 before:rounded-full" {...props} />,
                                                                p: ({ ...props }) => <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-lg leading-relaxed mb-4 lg:mb-6 font-semibold" {...props} />,
                                                                li: ({ ...props }) => <li className="text-slate-600 dark:text-slate-400 text-sm lg:text-lg mb-2 marker:text-amber-500 font-semibold" {...props} />,
                                                                strong: ({ ...props }) => <strong className="text-amber-600 dark:text-amber-400/90 font-black" {...props} />,
                                                            }}
                                                        >
                                                            {data.strategy}
                                                        </ReactMarkdown>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* 4. Bottom-Anchored Input Console */}
                <div className="absolute bottom-40 lg:bottom-6 left-0 right-0 flex justify-center w-full z-20 pointer-events-none px-4 lg:px-12 pb-safe lg:pb-0">
                    <div className="max-w-4xl w-full pointer-events-auto">
                        {showInput ? (
                            <div className="animate-in slide-in-from-bottom-16 duration-700">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative group/console"
                                >
                                    {/* Multi-Layered Premium Glow */}
                                    <div className="absolute -inset-1 lg:-inset-2 bg-gradient-to-r from-amber-500/20 via-orange-600/25 to-amber-500/20 rounded-[1.5rem] lg:rounded-[2.5rem] blur-2xl lg:blur-3xl opacity-20 group-hover/console:opacity-40 transition duration-1000 animate-pulse" />
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-600/30 rounded-[1.1rem] lg:rounded-[2.1rem] blur-sm opacity-0 group-focus-within/console:opacity-100 transition duration-500" />

                                    <Card className="relative rounded-[1.25rem] lg:rounded-[2rem] border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500/40">
                                        {/* Scanning Line Animation */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent -translate-x-full animate-[scan_3s_linear_infinite]" />

                                        <CardContent className="p-2 lg:p-3 flex gap-4 items-end relative z-10">
                                            <div className="flex-1 px-2 lg:px-3 py-1 flex flex-col">
                                                <span className="text-[8px] lg:text-[10px] uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black text-amber-500/50 mb-1 pointer-events-none select-none">
                                                    Strategic Terminal v2.1
                                                </span>
                                                <textarea
                                                    placeholder="Input Strategic Parameters..."
                                                    className="w-full resize-none min-h-[30px] max-h-[100px] border-0 focus:outline-none focus:ring-0 shadow-none text-sm lg:text-base bg-transparent p-0 placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 font-bold tracking-tight"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAnalyze();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2 pr-1 pb-1">
                                                {result && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 lg:h-11 lg:w-11 rounded-lg lg:rounded-[1.25rem] hover:bg-white/5 text-slate-600 transition-all active:scale-90"
                                                        onClick={() => setShowInput(false)}
                                                    >
                                                        <Minus size={18} className="lg:w-[22px] lg:h-[22px]" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg lg:rounded-[1rem] bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 hover:scale-110 transition-all duration-500 shadow-xl shadow-orange-500/20 active:scale-95 group/btn border border-white/10"
                                                    onClick={handleAnalyze}
                                                    disabled={loading || !query.trim()}
                                                >
                                                    {loading ? (
                                                        <Zap className="animate-pulse text-white" size={16} />
                                                    ) : (
                                                        <Send size={16} className="text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300 lg:w-[18px] lg:h-[18px]" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="flex justify-center pb-20 md:pb-6">
                                <Button
                                    size="lg"
                                    className={cn(
                                        "fixed md:relative bottom-32 right-6 md:bottom-auto md:right-auto z-50 md:z-auto",
                                        "h-14 w-14 md:h-11 md:w-auto px-0 md:px-8 rounded-full md:rounded-xl",
                                        "bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 shadow-[0_15px_40px_rgba(245,158,11,0.4)]",
                                        "flex items-center justify-center animate-in fade-in zoom-in duration-700 transform hover:scale-110 transition-all border border-white/20 active:scale-95 group ring-4 ring-amber-500/10 focus:outline-none"
                                    )}
                                    onClick={() => setShowInput(true)}
                                >
                                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform duration-300 text-white" />
                                    <span className="hidden md:inline-block ml-2 text-xs md:text-sm font-black tracking-tight text-white whitespace-nowrap">
                                        New Strategic Intelligence Cycle
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </PremiumGuard >
        </div >
    );
}
