"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Send, Sparkles, TrendingUp, TrendingDown, Minus, ShieldAlert,
    Zap, ExternalLink, BarChart3, History, ChevronRight, Scale
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        isFallback?: boolean;
    };
    technicals: {
        rsi: number;
        trend: string;
        macdHistogram: number;
        support: number;
        resistance: number;
        volumeShock?: string;
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

interface HistoryEntry {
    symbol: string;
    query: string;
    result: AnalysisResult;
    timestamp: number;
}

const SUGGESTION_CHIPS = [
    "Should I invest ₹50,000 in Reliance for 3 years?",
    "Is HDFC Bank a good medium-term investment?",
    "Analyse TCS for long-term wealth creation",
    "Is Infosys worth holding for 6 months?",
    "Long-term outlook on Adani Ports",
    "Should I buy ICICI Bank now?",
];

export default function StrategistPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showInput, setShowInput] = useState(true);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const liveData = useLivePrice({
        symbol: result?.symbol || "",
        initialPrice: result?.quote.regularMarketPrice || 0,
        initialChangePercent: result?.quote.regularMarketChangePercent || 0
    });

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    // Load history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("strategist_history");
            if (saved) setHistory(JSON.parse(saved));
        } catch { }
    }, []);

    // Rotating placeholder
    useEffect(() => {
        const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % SUGGESTION_CHIPS.length), 3000);
        return () => clearInterval(id);
    }, []);

    const saveToHistory = (q: string, r: AnalysisResult) => {
        const entry: HistoryEntry = { symbol: r.symbol, query: q, result: r, timestamp: Date.now() };
        setHistory(prev => {
            const updated = [entry, ...prev.filter(h => h.symbol !== r.symbol)].slice(0, 8);
            localStorage.setItem("strategist_history", JSON.stringify(updated));
            return updated;
        });
    };

    const handleAnalyze = async (customQuery?: string) => {
        const q = customQuery || query;
        if (!q.trim()) return;
        setLoading(true);
        setResult(null);
        setShowInput(false);

        try {
            const res = await fetch(`${API_BASE_URL}/strategist/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            saveToHistory(q, data);
            setQuery("");
            // Auto-scroll to top of result
            setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } catch (error: any) {
            toast.error(error.message || "Failed to analyze. Try again.");
            setShowInput(true);
        } finally {
            setLoading(false);
        }
    };

    const verdictColor = (strategy: string) => {
        const upper = strategy.toUpperCase();
        if (upper.includes("**VERDICT: BUY") || upper.includes("VERDICT: BUY")) return { badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: <TrendingUp size={16} />, glow: "from-emerald-500/10 to-emerald-600/5" };
        if (upper.includes("**VERDICT: AVOID") || upper.includes("VERDICT: AVOID")) return { badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: <TrendingDown size={16} />, glow: "from-rose-500/10 to-rose-600/5" };
        return { badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: <Minus size={16} />, glow: "from-amber-500/10 to-amber-600/5" };
    };

    // Parse conviction score from the strategy markdown
    const extractConvictionScore = (strategy: string): number => {
        const m = strategy.match(/Conviction Score[:\s*]+(\d+)\s*\/\s*100/i);
        return m ? Math.min(100, parseInt(m[1])) : 65;
    };

    const extractHorizon = (strategy: string): string => {
        const m = strategy.match(/\*\*Detected Horizon:\*\*\s*([^\n]+)/i);
        return m ? m[1].trim() : "Medium-Term";
    };

    return (
        <div className="relative flex flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100vh-5rem)] w-full overflow-hidden bg-white dark:bg-background text-slate-900 dark:text-slate-50 transition-colors duration-500">
            <PremiumGuard>
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[5%] -left-[10%] w-[60%] h-[40%] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-[5%] -right-[10%] w-[60%] h-[40%] bg-slate-500/10 dark:bg-slate-500/5 blur-[120px] rounded-full animate-pulse" />
                    <div
                        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
                        style={{
                            backgroundImage: `linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }}
                    />
                </div>

                {/* History Sidebar */}
                <AnimatePresence>
                    {showHistory && history.length > 0 && (
                        <motion.div
                            initial={{ x: -320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -320, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 z-30 w-72 bg-white/90 dark:bg-slate-950/90 border-r border-black/[0.07] dark:border-white/[0.06] backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <History size={15} className="text-amber-500" />
                                    <span className="text-sm font-bold tracking-tight">Analysis History</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}>
                                    <Minus size={14} />
                                </Button>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-3 space-y-2">
                                    {history.map((h, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left p-3 rounded-xl hover:bg-amber-500/5 border border-transparent hover:border-amber-500/15 transition-all group"
                                            onClick={() => { setResult(h.result); setShowInput(false); setShowHistory(false); }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black tracking-wide text-slate-900 dark:text-white">{h.symbol}</span>
                                                <ChevronRight size={12} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                            </div>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{h.query}</p>
                                            <p className="text-[9px] font-mono text-slate-400 mt-1">{new Date(h.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex-1 relative overflow-hidden">
                    <ScrollArea className="h-full z-10 scrollbar-hide" ref={scrollRef} type="hover">
                        <div className="max-w-5xl mx-auto px-0 lg:px-6 pb-96 lg:pb-56 pt-6 lg:pt-8">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-700 px-4 lg:px-0">
                                <div className="flex items-center gap-3">
                                    {history.length > 0 && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setShowHistory(v => !v)}>
                                            <History size={15} className="text-slate-500" />
                                        </Button>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={18} className="text-amber-500" />
                                        <h1 className="text-xl lg:text-2xl font-black tracking-tight">CIO Investment Desk</h1>
                                    </div>
                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                                        Long-Only Capital
                                    </Badge>
                                </div>
                                {result && result.fundamentals?.sector && (
                                    <div className="hidden lg:flex flex-col items-end opacity-60">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{result.fundamentals.sector}</p>
                                        <p className="text-[8px] font-mono text-slate-400">{result.fundamentals.industry}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 lg:space-y-7 px-2 lg:px-0">

                                {/* Empty State */}
                                {!result && !loading && showInput && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center min-h-[35vh] text-center px-4"
                                    >
                                        <div className="relative mb-6 group inline-block">
                                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                            <div className="relative p-7 rounded-[2rem] bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 backdrop-blur-2xl shadow-xl transition-all duration-700 group-hover:scale-105 group-hover:border-amber-500/20">
                                                <Scale size={52} className="text-amber-500 dark:text-amber-400 transition-transform group-hover:rotate-6" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-black mb-2 tracking-tighter">Chief Investment Officer</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed font-semibold">
                                            Institutional-grade investment analysis. Capital preservation first. Asymmetric upside second.
                                        </p>

                                        {/* Suggestion Chips — all 6 */}
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-3xl w-full">
                                            {SUGGESTION_CHIPS.map((chip, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setQuery(chip); handleAnalyze(chip); }}
                                                    className="text-left p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 group"
                                                >
                                                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-relaxed">{chip}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Loading */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in duration-500">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            <div className="absolute inset-4 border-4 border-slate-500/20 rounded-full animate-ping" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Scale size={18} className="text-amber-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <p className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent animate-pulse tracking-tighter">
                                                Assembling CIO Brief
                                            </p>
                                            <div className="relative h-1 w-48 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-600 animate-[loading_2s_infinite]" style={{ width: '40%' }} />
                                            </div>
                                            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.3em] opacity-60">
                                                Horizon Detection • Scenario Modeling • Risk Matrix
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── CIO RESULT CARDS ── */}
                                {result && (() => {
                                    const d = result;
                                    const vc = verdictColor(d.strategy);
                                    const convictionScore = extractConvictionScore(d.strategy);
                                    const horizon = extractHorizon(d.strategy);
                                    const isUp = d.quote.regularMarketChangePercent >= 0;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            className="space-y-5"
                                        >
                                            {/* Fallback warning */}
                                            {d.isFallback && (
                                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                                                    <ShieldAlert className="text-amber-500 shrink-0 w-5 h-5" />
                                                    <div>
                                                        <p className="text-amber-500 font-black text-sm">Fundamental Data Incomplete</p>
                                                        <p className="text-amber-500/60 font-semibold text-[10px]">Yahoo Finance is under load. Analysis uses alternative sources.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Card 1: VERDICT + LIVE PRICE ── */}
                                            <div className={cn("relative group rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border backdrop-blur-[40px] shadow-2xl ring-1 ring-black/[0.05] dark:ring-white/5", "bg-white/70 dark:bg-slate-950/60 border-black/[0.05] dark:border-white/5")}>
                                                {/* Top glow accent */}
                                                <div className={cn("absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r", vc.glow, "via-amber-500/40 to-transparent")} />
                                                <div className="p-5 lg:p-7">
                                                    <div className="flex flex-col lg:flex-row gap-5 lg:gap-0 justify-between items-start">
                                                        {/* Left: Symbol + Price */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-3xl lg:text-4xl font-black tracking-tighter">{d.symbol.replace('.NS', '').replace('.BO', '')}</span>
                                                                <Badge className="bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/10 dark:border-white/10 text-[10px] font-bold">NSE</Badge>
                                                                <Badge className={cn("gap-1 border text-xs font-bold", vc.badge)}>
                                                                    {vc.icon} {horizon}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <span className="text-xl font-bold">₹{d.quote.regularMarketPrice.toLocaleString('en-IN')}</span>
                                                                <span className={cn("text-xs font-black px-2.5 py-0.5 rounded-lg border", isUp ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-rose-500 border-rose-500/20 bg-rose-500/5")}>
                                                                    {isUp ? "+" : ""}{d.quote.regularMarketChangePercent.toFixed(2)}%
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delayed</span>
                                                            </div>
                                                            {/* Live pulse */}
                                                            <div className="flex items-center gap-2">
                                                                <div className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                                                </div>
                                                                <span className={cn("text-[10px] lg:text-xs font-black tracking-widest uppercase transition-colors", liveData.flash === 'up' ? "text-emerald-500" : liveData.flash === 'down' ? "text-rose-500" : "text-amber-500/70")}>
                                                                    Live: ₹{liveData.price.toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Conviction Score Ring */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-20 h-20 lg:w-24 lg:h-24">
                                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                                                    <circle
                                                                        cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                                                                        strokeDasharray={`${2 * Math.PI * 42}`}
                                                                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - convictionScore / 100)}`}
                                                                        strokeLinecap="round"
                                                                        className={cn("transition-all duration-1000", convictionScore >= 70 ? "text-emerald-500" : convictionScore >= 45 ? "text-amber-500" : "text-rose-500")}
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                    <span className={cn("text-lg lg:text-xl font-black", convictionScore >= 70 ? "text-emerald-500" : convictionScore >= 45 ? "text-amber-500" : "text-rose-500")}>{convictionScore}</span>
                                                                    <span className="text-[8px] uppercase tracking-wider font-black text-slate-400">/ 100</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">CIO Score</p>
                                                                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Conviction</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 52W range bar */}
                                                    <div className="mt-5 pt-4 border-t border-black/[0.05] dark:border-white/[0.04]">
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                                            <span>52W Low ₹{d.quote.fiftyTwoWeekLow?.toLocaleString('en-IN') ?? '—'}</span>
                                                            <span>52W High ₹{d.quote.fiftyTwoWeekHigh?.toLocaleString('en-IN') ?? '—'}</span>
                                                        </div>
                                                        {d.quote.fiftyTwoWeekLow && d.quote.fiftyTwoWeekHigh && (
                                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                                                    style={{
                                                                        width: `${Math.min(100, ((d.quote.regularMarketPrice - d.quote.fiftyTwoWeekLow) / (d.quote.fiftyTwoWeekHigh - d.quote.fiftyTwoWeekLow)) * 100)}%`
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Fundamentals Vitality Bar ── */}
                                            {(d.fundamentals?.pe || d.fundamentals?.roe || d.fundamentals?.revenueGrowth || d.fundamentals?.debtToEquity) && (
                                                <Card className="bg-white/40 dark:bg-slate-900/40 border-black/[0.05] dark:border-white/5 backdrop-blur-3xl rounded-[1.5rem] overflow-hidden shadow-lg ring-1 ring-black/[0.05] dark:ring-white/5">
                                                    <CardContent className="p-4 lg:p-5">
                                                        <p className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-400 mb-3">Fundamental Vitality</p>
                                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                            {[
                                                                { label: "P/E", value: d.fundamentals.pe?.toFixed(1) ?? "N/A", color: "text-slate-900 dark:text-white" },
                                                                { label: "P/B", value: d.fundamentals.pb?.toFixed(2) ?? "N/A", color: "text-slate-900 dark:text-white" },
                                                                { label: "ROE", value: d.fundamentals.roe ? `${(d.fundamentals.roe * 100).toFixed(1)}%` : "N/A", color: "text-emerald-500" },
                                                                { label: "Rev Growth", value: d.fundamentals.revenueGrowth ? `${(d.fundamentals.revenueGrowth * 100).toFixed(1)}%` : "N/A", color: "text-amber-500" },
                                                                { label: "D/E", value: d.fundamentals.debtToEquity?.toFixed(2) ?? "N/A", color: d.fundamentals.debtToEquity && d.fundamentals.debtToEquity > 1 ? "text-rose-500" : "text-slate-700 dark:text-slate-300" },
                                                                { label: "Curr. Ratio", value: d.fundamentals.currentRatio?.toFixed(2) ?? "N/A", color: "text-slate-700 dark:text-slate-300" },
                                                            ].map((stat, i) => (
                                                                <div key={i} className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-center">
                                                                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-black mb-1">{stat.label}</p>
                                                                    <p className={cn("text-sm font-black tracking-tight font-mono", stat.color)}>{stat.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* ── Card 2: Brokerage Sentiment + News ── */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                {/* Ownership / Recommendation */}
                                                {d.fundamentals?.recommendationTrend && (
                                                    <Card className="bg-white/40 dark:bg-slate-900/40 border-black/[0.05] dark:border-white/5 backdrop-blur-3xl rounded-[1.5rem] overflow-hidden shadow-lg ring-1 ring-black/[0.05] dark:ring-white/5">
                                                        <CardHeader className="p-5 pb-3">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <BarChart3 size={16} className="text-indigo-500" />
                                                                <CardTitle className="text-sm font-bold">Institutional Consensus</CardTitle>
                                                            </div>
                                                            <CardDescription className="text-[10px]">Global brokerage analyst ratings</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="px-5 pb-5 space-y-2">
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                                                                    <p className="text-[8px] uppercase font-black text-emerald-600">Buy</p>
                                                                    <p className="font-black text-lg text-emerald-600">{d.fundamentals.recommendationTrend.buy + d.fundamentals.recommendationTrend.strongBuy}</p>
                                                                </div>
                                                                <div className="text-center p-2 rounded-xl bg-slate-500/10">
                                                                    <p className="text-[8px] uppercase font-black text-slate-500">Hold</p>
                                                                    <p className="font-black text-lg text-slate-500">{d.fundamentals.recommendationTrend.hold}</p>
                                                                </div>
                                                                <div className="text-center p-2 rounded-xl bg-rose-500/10">
                                                                    <p className="text-[8px] uppercase font-black text-rose-600">Sell</p>
                                                                    <p className="font-black text-lg text-rose-600">{d.fundamentals.recommendationTrend.sell + d.fundamentals.recommendationTrend.strongSell}</p>
                                                                </div>
                                                            </div>
                                                            {(d.fundamentals?.insidersPercent || d.fundamentals?.institutionsPercent) && (
                                                                <div className="space-y-2.5 mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.04]">
                                                                    {d.fundamentals.institutionsPercent && (
                                                                        <div>
                                                                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-1">
                                                                                <span>Institutions</span><span>{(d.fundamentals.institutionsPercent * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.fundamentals.institutionsPercent * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {d.fundamentals.insidersPercent && (
                                                                        <div>
                                                                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-1">
                                                                                <span>Insiders / Promoters</span><span>{(d.fundamentals.insidersPercent * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.fundamentals.insidersPercent * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* News */}
                                                <Card className="bg-white/40 dark:bg-slate-900/40 border-black/[0.05] dark:border-white/5 backdrop-blur-3xl rounded-[1.5rem] overflow-hidden shadow-lg ring-1 ring-black/[0.05] dark:ring-white/5">
                                                    <CardHeader className="p-5 pb-3">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <Zap size={16} className="text-amber-500" />
                                                            <CardTitle className="text-sm font-bold">Market Catalysts</CardTitle>
                                                        </div>
                                                        <CardDescription className="text-[10px]">Recent news influencing thesis</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="px-4 pb-5 space-y-1.5">
                                                        {d.news && d.news.length > 0 ? d.news.slice(0, 3).map((item: any, i: number) => (
                                                            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                                                                className="group flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-amber-500/5 border border-transparent hover:border-amber-500/10 transition-all">
                                                                <span className="text-[9px] font-mono text-amber-500/60 shrink-0 mt-0.5 font-black">#{i + 1}</span>
                                                                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.title}</p>
                                                                <ExternalLink size={9} className="text-slate-300 shrink-0 mt-0.5 group-hover:text-amber-400 transition-colors" />
                                                            </a>
                                                        )) : <p className="text-xs text-slate-400 font-medium p-3 text-center italic">No high-impact catalysts in last 24h.</p>}
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* ── Card 3: Full CIO Brief Markdown ── */}
                                            <Card className="bg-white/50 dark:bg-slate-900/20 border-black/[0.05] dark:border-white/[0.03] backdrop-blur-xl rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-2xl relative">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                                                <CardContent className="p-5 lg:p-10 pb-10 prose prose-sm prose-slate dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h2: ({ ...props }) => <h2 className="text-lg lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-5 mt-8 first:mt-0 border-l-4 border-amber-500 pl-4" {...props} />,
                                                            h3: ({ ...props }) => <h3 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-3 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:bg-gradient-to-b before:from-amber-400 before:to-orange-600 before:rounded-full before:shrink-0" {...props} />,
                                                            p: ({ ...props }) => <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base leading-relaxed mb-4 font-medium" {...props} />,
                                                            li: ({ ...props }) => <li className="text-slate-600 dark:text-slate-400 text-sm lg:text-base mb-2 marker:text-amber-500 font-medium" {...props} />,
                                                            strong: ({ ...props }) => <strong className="text-slate-900 dark:text-white font-black" {...props} />,
                                                            table: ({ ...props }) => <div className="overflow-x-auto my-4 rounded-xl border border-black/[0.06] dark:border-white/[0.06]"><table className="w-full text-sm" {...props} /></div>,
                                                            thead: ({ ...props }) => <thead className="bg-slate-50 dark:bg-slate-800/60" {...props} />,
                                                            th: ({ ...props }) => <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-black/[0.05] dark:border-white/[0.05]" {...props} />,
                                                            td: ({ ...props }) => <td className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0" {...props} />,
                                                            hr: () => <hr className="border-black/[0.05] dark:border-white/[0.05] my-6" />,
                                                            em: ({ ...props }) => <em className="text-slate-400 dark:text-slate-500 not-italic text-xs font-medium" {...props} />,
                                                        }}
                                                    >
                                                        {d.strategy}
                                                    </ReactMarkdown>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })()}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* ── Bottom Input Console ── */}
                <div className="absolute bottom-40 lg:bottom-6 left-0 right-0 flex justify-center w-full z-20 pointer-events-none px-4 lg:px-12 pb-safe lg:pb-0">
                    <div className="max-w-3xl w-full pointer-events-auto">
                        {showInput ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group/console">
                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-orange-600/25 to-amber-500/20 rounded-[2.5rem] blur-3xl opacity-15 group-hover/console:opacity-35 transition duration-1000 animate-pulse" />
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-600/30 rounded-[2.1rem] blur-sm opacity-0 group-focus-within/console:opacity-100 transition duration-500" />
                                <Card className="relative rounded-[2rem] border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500/40">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent -translate-x-full animate-[scan_3s_linear_infinite]" />
                                    <CardContent className="p-2 lg:p-3 flex gap-4 items-end relative z-10">
                                        <div className="flex-1 px-3 py-1 flex flex-col">
                                            <span className="text-[8px] lg:text-[10px] uppercase tracking-[0.3em] font-black text-amber-500/50 mb-1 pointer-events-none select-none">
                                                CIO Terminal — Long-Only Capital
                                            </span>
                                            <textarea
                                                placeholder={SUGGESTION_CHIPS[placeholderIdx]}
                                                className="w-full resize-none min-h-[30px] max-h-[100px] border-0 focus:outline-none focus:ring-0 shadow-none text-sm lg:text-base bg-transparent p-0 placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 font-semibold tracking-tight"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); }
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 pr-1 pb-1">
                                            {result && (
                                                <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-11 lg:w-11 rounded-[1.25rem] hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 transition-all active:scale-90" onClick={() => setShowInput(false)}>
                                                    <Minus size={18} />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                className="h-10 w-10 lg:h-12 lg:w-12 rounded-[1rem] bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 hover:scale-110 transition-all duration-500 shadow-xl shadow-orange-500/20 active:scale-95 border border-white/10"
                                                onClick={() => handleAnalyze()}
                                                disabled={loading || !query.trim()}
                                            >
                                                {loading ? <Zap className="animate-pulse text-white" size={16} /> : <Send size={16} className="text-white" />}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="flex justify-center pb-20 md:pb-6">
                                <Button
                                    size="lg"
                                    className={cn(
                                        "fixed md:relative bottom-32 right-6 md:bottom-auto md:right-auto z-50 md:z-auto",
                                        "h-14 w-14 md:h-11 md:w-auto px-0 md:px-8 rounded-full md:rounded-xl",
                                        "bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 shadow-[0_15px_40px_rgba(245,158,11,0.4)]",
                                        "flex items-center justify-center animate-in fade-in zoom-in duration-700 hover:scale-110 transition-all border border-white/20 active:scale-95 ring-4 ring-amber-500/10"
                                    )}
                                    onClick={() => setShowInput(true)}
                                >
                                    <Sparkles size={22} className="text-white" />
                                    <span className="hidden md:inline-block ml-2 text-sm font-black text-white whitespace-nowrap">New CIO Brief</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </PremiumGuard>
        </div>
    );
}
