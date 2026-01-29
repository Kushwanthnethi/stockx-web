"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info, RefreshCw, AlertCircle, Zap, ShieldCheck, Activity, Landmark, Target, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface VerdictCardProps {
    stock: {
        symbol: string;
        companyName: string;
        currentPrice: number;
        changePercent: number;
        technical?: {
            rsi: number;
            trend: string;
            signal: string;
            score: number;
            summary: string;
            syntheticRationale?: string;
        };
        institutional?: {
            verdict: string;
            score: number;
            confidence: number;
            breakdown: {
                analysts: number | string;
                earnings: string;
                tech: string;
            };
        };
        verdict: {
            verdict: string;
            confidence: number;
            rationale: string;
            generatedAt: string;
        } | null;
    };
    isThrottled?: boolean;
}

export function VerdictCard({ stock, isThrottled }: VerdictCardProps) {
    const { verdict, technical, institutional } = stock;
    const isGeneratingAi = !verdict;
    const displayRationale = verdict?.rationale || technical?.syntheticRationale || "";

    const getVerdictColor = (v?: string) => {
        switch (v) {
            case "BUY": return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
            case "SELL": return "text-rose-500 border-rose-500/20 bg-rose-500/5";
            case "HOLD": return "text-amber-500 border-amber-500/20 bg-amber-500/5";
            default: return "text-muted-foreground border-border bg-muted/5";
        }
    };

    const getStatusColor = (v?: string | number) => {
        if (v === 'BULLISH' || v === 'BUY' || v === 'BEAT' || (typeof v === 'number' && v < 2.5)) return "text-emerald-500";
        if (v === 'BEARISH' || v === 'SELL' || v === 'MISS' || (typeof v === 'number' && v > 3.5)) return "text-rose-500";
        return "text-amber-500";
    };

    // Parsing logic for delimited rationales
    const parseRationale = (raw: string) => {
        const headlineMatch = raw.match(/\[HEADLINE\]([\s\S]*?)(\[|$)/);
        const triggersMatch = raw.match(/\[TRIGGERS\]([\s\S]*?)(\[|$)/);
        const contentMatch = raw.match(/\[CONTENT\]([\s\S]*)$/);

        return {
            headline: headlineMatch ? headlineMatch[1].trim() : "",
            triggers: triggersMatch ? triggersMatch[1].trim().split('|').map(t => t.trim()) : [],
            content: contentMatch ? contentMatch[1].trim() : raw.replace(/\[.*?\]/g, "").trim()
        };
    };

    const parsed = parseRationale(displayRationale);

    return (
        <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-2xl transition-all hover:border-primary/40 hover:shadow-xl group flex flex-col relative min-h-[440px] border-t-4 border-t-transparent">
            {/* Top Identity Section */}
            <div className="p-5 pb-3 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-foreground">${stock.symbol.split('.')[0]}</span>
                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5">• {stock.companyName}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">₹{stock.currentPrice?.toLocaleString('en-IN')}</span>
                        <span className={cn(
                            "text-xs font-bold",
                            stock.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}
                        </span>
                    </div>
                </div>
                {institutional && (
                    <Badge className={cn(
                        "text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide border",
                        institutional.verdict === 'BUY' ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" :
                            institutional.verdict === 'SELL' ? "border-rose-500/30 text-rose-500 bg-rose-500/5" :
                                "border-blue-500/30 text-blue-500 bg-blue-500/5"
                    )}>
                        {institutional.verdict === 'BUY' ? 'STRONG BUY' : institutional.verdict === 'SELL' ? 'DISTRIBUTE' : 'HOLD TIGHT'}
                    </Badge>
                )}
            </div>

            <div className="px-5 flex-grow flex flex-col gap-4">

                {/* RESTORED: Institutional Intelligence Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/10 bg-muted/5 rounded-lg px-2">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Analysts</span>
                        <div className="flex items-center gap-1">
                            <Landmark size={10} className="text-muted-foreground/50" />
                            <span className={cn("text-[10px] font-bold", getStatusColor(institutional?.breakdown.analysts))}>
                                {typeof institutional?.breakdown.analysts === 'number'
                                    ? institutional.breakdown.analysts.toFixed(1)
                                    : institutional?.breakdown.analysts}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-l border-border/10">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Earnings</span>
                        <div className="flex items-center gap-1">
                            <Target size={10} className="text-muted-foreground/50" />
                            <span className={cn("text-[10px] font-bold", getStatusColor(institutional?.breakdown.earnings))}>
                                {institutional?.breakdown.earnings}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-l border-border/10">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Momentum</span>
                        <div className="flex items-center gap-1">
                            <Gauge size={10} className="text-muted-foreground/50" />
                            <span className={cn("text-[10px] font-bold", getStatusColor(institutional?.breakdown.tech))}>
                                {institutional?.breakdown.tech}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TRIGGERS Section - Slightly Reduced */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-muted-foreground/60">
                        <div className="h-1.5 w-1.5 bg-primary/70 rounded-full" />
                        TRIGGERS: {parsed.triggers.length > 0 ? parsed.triggers.join(' & ').toUpperCase() : 'MARKET VOLATILITY'}
                    </div>
                </div>

                {/* Main Headline - Use standard font */}
                <h4 className="text-lg font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                    {parsed.headline || (institutional?.verdict === 'BUY' ? "Strategic capital accumulation indicated by core metrics." : "Balanced market outlook suggests tactical holding.")}
                </h4>

                {/* Rationale Quote Box - Remove italics */}
                <div className="bg-muted/10 border border-border/20 rounded-xl p-4 relative">
                    <div className="text-[11px] font-medium text-muted-foreground/90 leading-relaxed">
                        <span className="text-foreground font-bold text-[11px] block mb-1">The Verdict:</span>
                        "{parsed.content?.slice(0, 220)}..."
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-6 mt-auto flex items-center justify-between border-t border-border/10">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide">
                    {new Date(verdict?.generatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <a
                    href={`/stock/${stock.symbol}`}
                    className="text-[10px] font-bold text-primary uppercase tracking-wide hover:underline flex items-center gap-1"
                >
                    Deep Dive
                    <TrendingUp size={12} className="rotate-45" />
                </a>
            </div>
        </Card>
    );
}
