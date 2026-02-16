"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, TrendingUp, TrendingDown, Minus, ShieldAlert, Target, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PremiumGuard } from "@/components/shared/premium-guard";
import { API_BASE_URL } from "@/lib/config";

interface AnalysisResult {
    symbol: string;
    quote: {
        regularMarketPrice: number;
        regularMarketChangePercent: number;
    };
    technicals: {
        rsi: number;
        trend: string;
        macdHistogram: number;
        support: number;
        resistance: number;
    };
    strategy: string;
}

export default function StrategistPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showInput, setShowInput] = useState(true);

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
                    <ScrollArea className="h-full z-10 scrollbar-hide" ref={scrollRef} type="always">
                        <div className="max-w-7xl mx-auto px-2 md:px-6 pb-96 md:pb-56 pt-6 md:pt-8">
                            {/* Integrated Header Area */}
                            <div className="flex flex-col gap-1 md:gap-1.5 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={20} className="text-amber-500 md:w-6 md:h-6" />
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        Market Strategist
                                    </h1>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[xs] md:text-sm font-semibold ml-0.5 tracking-tight max-w-xl leading-relaxed">
                                    AI-Driven Strategic Alpha. Fusing technical indicators & fundamental charts for institutional-grade portfolio guidance.
                                </p>
                            </div>

                            <div className="space-y-8 md:space-y-10">
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
                                                Example: "I bought 50 shares of SBIN at ₹600. Next move?"
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
                                {result && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                        {/* Verdict Banner Card */}
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-[2rem] blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-40 transition duration-1000" />
                                            <Card className="relative bg-white/70 dark:bg-slate-950/60 border-black/[0.05] dark:border-white/5 backdrop-blur-[40px] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/[0.05] dark:ring-white/5">
                                                <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] dark:opacity-[0.02]">
                                                    <TrendingUp size={200} className="text-amber-500" />
                                                </div>
                                                <CardHeader className="p-5 md:p-8 relative z-10">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                        <div className="space-y-1.5 md:space-y-2">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <span className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-2xl">
                                                                    {result.symbol}
                                                                </span>
                                                                <Badge className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white border-black/10 dark:border-white/10 text-xs md:text-base px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-xl font-bold">
                                                                    NSE
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 md:gap-3">
                                                                <span className="text-lg md:text-xl font-bold text-slate-600 dark:text-slate-400 tracking-tight">
                                                                    ₹{result.quote.regularMarketPrice.toLocaleString()}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs md:text-base font-black px-2 md:px-3 py-0.5 rounded-[8px] md:rounded-[10px] border",
                                                                    result.quote.regularMarketChangePercent >= 0
                                                                        ? "text-emerald-500 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/5"
                                                                        : "text-rose-500 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/10 bg-rose-500/5"
                                                                )}>
                                                                    {result.quote.regularMarketChangePercent >= 0 ? "+" : ""}{result.quote.regularMarketChangePercent.toFixed(2)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex md:flex-col gap-2 md:gap-3 items-center md:items-end w-full md:w-auto">
                                                            <TrendBadge trend={result.technicals.trend} />
                                                            <RsiBadge value={result.technicals.rsi} />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-5 md:p-8 pt-0 relative z-10">
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-5 md:pt-6 border-t border-black/[0.05] dark:border-white/[0.03]">
                                                        {[
                                                            { label: "Support", mobileLabel: "Support", value: `₹${result.technicals.support.toLocaleString()}`, color: "text-emerald-600 dark:text-emerald-400" },
                                                            { label: "Resistance", mobileLabel: "Resist", value: `₹${result.technicals.resistance.toLocaleString()}`, color: "text-orange-600 dark:text-orange-400" },
                                                            { label: "AI Momentum", mobileLabel: "Momentum", value: result.technicals.macdHistogram > 0 ? "BULL" : "BEAR", color: result.technicals.macdHistogram > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
                                                            { label: "Confidence", mobileLabel: "Confid.", value: "HIGH", color: "text-amber-600 dark:text-amber-400" }
                                                        ].map((item, i) => (
                                                            <div key={i} className="group/item relative p-3 md:p-4 rounded-xl md:rounded-[1.5rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all duration-500 hover:scale-[1.02]">
                                                                <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 dark:text-slate-600 font-black mb-1 md:mb-2">{item.label}</p>
                                                                <p className={cn("text-base md:text-xl font-black tracking-tight font-mono", item.color)}>{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Detailed Strategy Markdown */}
                                        <Card className="bg-white/50 dark:bg-slate-900/20 border-black/[0.05] dark:border-white/[0.03] backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl relative">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                                            <CardContent className="p-6 md:p-12 pb-12 prose prose-slate dark:prose-invert prose-amber max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ ...props }) => <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-6 md:mb-8 border-l-4 border-amber-500 pl-4 md:pl-6 drop-shadow-md" {...props} />,
                                                        h2: ({ ...props }) => <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 md:mt-12 mb-4 md:mb-6 flex items-center gap-3 md:gap-4 before:content-[''] before:w-1.5 md:before:w-2 before:h-6 md:before:h-8 before:bg-gradient-to-b before:from-amber-400 before:to-orange-600 before:rounded-full" {...props} />,
                                                        p: ({ ...props }) => <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg leading-relaxed mb-4 md:mb-6 font-semibold" {...props} />,
                                                        li: ({ ...props }) => <li className="text-slate-600 dark:text-slate-400 text-sm md:text-lg mb-2 marker:text-amber-500 font-semibold" {...props} />,
                                                        strong: ({ ...props }) => <strong className="text-amber-600 dark:text-amber-400/90 font-black" {...props} />,
                                                    }}
                                                >
                                                    {result.strategy}
                                                </ReactMarkdown>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* 4. Bottom-Anchored Input Console */}
                <div className="absolute bottom-40 md:bottom-6 left-0 right-0 flex justify-center w-full z-20 pointer-events-none px-4 md:px-12 pb-safe md:pb-0">
                    <div className="max-w-4xl w-full pointer-events-auto">
                        {showInput ? (
                            <div className="animate-in slide-in-from-bottom-16 duration-700">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative group/console"
                                >
                                    {/* Multi-Layered Premium Glow */}
                                    <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-amber-500/20 via-orange-600/25 to-amber-500/20 rounded-[1.5rem] md:rounded-[2.5rem] blur-2xl md:blur-3xl opacity-20 group-hover/console:opacity-40 transition duration-1000 animate-pulse" />
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-600/30 rounded-[1.1rem] md:rounded-[2.1rem] blur-sm opacity-0 group-focus-within/console:opacity-100 transition duration-500" />

                                    <Card className="relative rounded-[1.25rem] md:rounded-[2rem] border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500/40">
                                        {/* Scanning Line Animation */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent -translate-x-full animate-[scan_3s_linear_infinite]" />

                                        <CardContent className="p-2 md:p-3 flex gap-4 items-end relative z-10">
                                            <div className="flex-1 px-2 md:px-3 py-1 flex flex-col">
                                                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black text-amber-500/50 mb-1 pointer-events-none select-none">
                                                    Strategic Terminal v2.1
                                                </span>
                                                <textarea
                                                    placeholder="Input Strategic Parameters..."
                                                    className="w-full resize-none min-h-[30px] max-h-[100px] border-0 focus:outline-none focus:ring-0 shadow-none text-sm md:text-base bg-transparent p-0 placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 font-bold tracking-tight"
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
                                                        className="h-9 w-9 md:h-11 md:w-11 rounded-lg md:rounded-[1.25rem] hover:bg-white/5 text-slate-600 transition-all active:scale-90"
                                                        onClick={() => setShowInput(false)}
                                                    >
                                                        <Minus size={18} className="md:w-[22px] md:h-[22px]" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-[1rem] bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 hover:scale-110 transition-all duration-500 shadow-xl shadow-orange-500/20 active:scale-95 group/btn border border-white/10"
                                                    onClick={handleAnalyze}
                                                    disabled={loading || !query.trim()}
                                                >
                                                    {loading ? (
                                                        <Zap className="animate-pulse text-white" size={16} />
                                                    ) : (
                                                        <Send size={16} className="text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300 md:w-[18px] md:h-[18px]" />
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
            </PremiumGuard>
        </div>
    );
}
