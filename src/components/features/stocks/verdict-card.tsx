"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function VerdictCard({ stock }: VerdictCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { verdict, institutional } = stock;

    const displayVerdict = verdict?.verdict || institutional?.verdict || "HOLD";
    const confidence = verdict?.confidence || institutional?.confidence || 50;
    const rawRationale = verdict?.rationale || "";

    // Parse rationale — strip markdown ** and extract sections
    const sanitize = (text: string) => text.replace(/\*\*/g, "").replace(/\*/g, "");
    const parseRationale = (raw: string) => {
        const headlineMatch = raw.match(/\[HEADLINE\]([\s\S]*?)(\[|$)/);
        const contentMatch = raw.match(/\[CONTENT\]([\s\S]*)$/);
        return {
            headline: headlineMatch ? sanitize(headlineMatch[1].trim()) : "",
            content: contentMatch
                ? sanitize(contentMatch[1].trim())
                : sanitize(raw.replace(/\[.*?\]/g, "").trim()),
        };
    };

    const parsed = parseRationale(rawRationale);
    const headline = parsed.headline ||
        (displayVerdict === "BUY"
            ? `${stock.symbol.split(".")[0]} shows strong fundamentals`
            : displayVerdict === "SELL"
                ? `${stock.symbol.split(".")[0]} faces headwinds`
                : `${stock.symbol.split(".")[0]} remains range-bound`);

    const displaySymbol = stock.symbol?.split(".")[0] || stock.symbol;

    // Color helpers
    const verdictColor = {
        BUY: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
        SELL: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "bg-rose-500" },
        HOLD: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "bg-amber-500" },
    }[displayVerdict] || { text: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", bar: "bg-muted-foreground" };

    const getStatusColor = (v?: string | number) => {
        if (v === "BULLISH" || v === "BUY" || v === "BEAT" || (typeof v === "number" && v < 2.5)) return "text-emerald-400";
        if (v === "BEARISH" || v === "SELL" || v === "MISS" || (typeof v === "number" && v > 3.5)) return "text-rose-400";
        return "text-amber-400";
    };

    return (
        <Card className="overflow-hidden border-border/30 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg group flex flex-col rounded-xl">
            {/* Header: Symbol + Price + Badge */}
            <div className="p-4 pb-3 flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold tracking-tight text-foreground">{displaySymbol}</span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium truncate max-w-[140px]">
                            {stock.companyName}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">
                            ₹{stock.currentPrice?.toLocaleString("en-IN")}
                        </span>
                        <span className={cn(
                            "text-[11px] font-semibold",
                            stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent?.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Verdict Badge */}
                <div className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border",
                    verdictColor.text, verdictColor.bg, verdictColor.border
                )}>
                    {displayVerdict}
                </div>
            </div>

            {/* Confidence Bar */}
            <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">Confidence</span>
                    <span className={cn("text-[10px] font-bold", verdictColor.text)}>{confidence}%</span>
                </div>
                <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-700", verdictColor.bar)}
                        style={{ width: `${Math.min(confidence, 100)}%` }}
                    />
                </div>
            </div>

            {/* Metrics Row */}
            {institutional && (
                <div className="mx-4 mb-3 grid grid-cols-3 gap-px bg-border/10 rounded-lg overflow-hidden">
                    <div className="bg-card/60 px-2 py-2 flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Analysts</span>
                        <span className={cn("text-[10px] font-bold", getStatusColor(institutional.breakdown.analysts))}>
                            {typeof institutional.breakdown.analysts === "number"
                                ? institutional.breakdown.analysts.toFixed(1)
                                : institutional.breakdown.analysts}
                        </span>
                    </div>
                    <div className="bg-card/60 px-2 py-2 flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Earnings</span>
                        <span className={cn("text-[10px] font-bold", getStatusColor(institutional.breakdown.earnings))}>
                            {institutional.breakdown.earnings}
                        </span>
                    </div>
                    <div className="bg-card/60 px-2 py-2 flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Momentum</span>
                        <span className={cn("text-[10px] font-bold", getStatusColor(institutional.breakdown.tech))}>
                            {institutional.breakdown.tech}
                        </span>
                    </div>
                </div>
            )}

            {/* Headline */}
            <div className="px-4 pb-2">
                <h4 className="text-[13px] font-semibold text-foreground/90 leading-snug line-clamp-2">
                    {headline}
                </h4>
            </div>

            {/* Rationale — expandable */}
            {parsed.content && (
                <div className="px-4 pb-3 flex-grow">
                    <p className={cn(
                        "text-[11px] text-muted-foreground/70 leading-relaxed",
                        expanded ? "" : "line-clamp-3"
                    )}>
                        {parsed.content}
                    </p>
                    {parsed.content.length > 150 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-[10px] text-primary font-medium mt-1 flex items-center gap-0.5 hover:underline"
                        >
                            {expanded ? (
                                <><ChevronUp size={10} /> Show less</>
                            ) : (
                                <><ChevronDown size={10} /> Read more</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="p-4 pt-2 mt-auto flex items-center justify-between border-t border-border/10">
                <span className="text-[10px] text-muted-foreground/40 font-medium">
                    {verdict?.generatedAt
                        ? new Date(verdict.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Pending"}
                </span>
                <a
                    href={`/stock/${stock.symbol}`}
                    className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                    Deep Dive <TrendingUp size={10} className="rotate-45" />
                </a>
            </div>
        </Card>
    );
}
