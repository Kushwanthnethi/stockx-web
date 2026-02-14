"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type VerdictType = "BUY" | "HOLD" | "WAIT" | "AVOID" | "SELL";

interface VerdictCardProps {
    symbol: string;
    companyName: string;
    price: string;
    change: string;
    isPositiveChange: boolean;
    verdict: VerdictType;
    headline: string;
    rationale: string;
    catalyst: string;
    date: string;
    author?: string;
}

const getVerdictStyle = (type: VerdictType) => {
    switch (type) {
        case "BUY":
            return {
                bg: "bg-emerald-500/10",
                text: "text-emerald-500",
                border: "border-emerald-500/20",
                icon: TrendingUp,
                label: "STRONG BUY"
            };
        case "SELL":
            return {
                bg: "bg-red-500/10",
                text: "text-red-500",
                border: "border-red-500/20",
                icon: AlertCircle,
                label: "SELL NOW"
            };
        case "HOLD":
            return {
                bg: "bg-blue-500/10",
                text: "text-blue-500",
                border: "border-blue-500/20",
                icon: CheckCircle2,
                label: "HOLD TIGHT"
            };
        case "WAIT":
            return {
                bg: "bg-amber-500/10",
                text: "text-amber-500",
                border: "border-amber-500/20",
                icon: Clock,
                label: "WAIT & WATCH"
            };
        case "AVOID":
            return {
                bg: "bg-zinc-500/10",
                text: "text-zinc-400",
                border: "border-zinc-500/20",
                icon: XCircle,
                label: "AVOID"
            };
    }
};

export function VerdictCard({
    symbol,
    companyName,
    price,
    change,
    isPositiveChange,
    verdict,
    headline,
    rationale,
    catalyst,
    date,
    author = "StocksX Intelligence"
}: VerdictCardProps) {
    const style = getVerdictStyle(verdict);
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative cursor-pointer h-full"
        >
            <div className={cn(
                "relative z-10 flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full",
                style.border
            )}>
                {/* Header: Stock Info & Verdict Badge */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold tracking-tight">${symbol}</h3>
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                • {companyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{price}</span>
                            <span className={cn(isPositiveChange ? "text-green-500" : "text-red-500")}>
                                {change}
                            </span>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase border",
                        style.bg,
                        style.text,
                        style.border
                    )}>
                        <Icon className="h-3.5 w-3.5" />
                        {style.label}
                    </div>
                </div>

                {/* The Catalyst */}
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Triggers: {catalyst}
                    </div>
                    <h4 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                        {headline}
                    </h4>
                </div>

                {/* The Verdict Logic */}
                <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                    <p className="text-sm leading-relaxed text-muted-foreground/90 italic">
                        <span className="not-italic font-bold text-foreground mr-1">The ${symbol} Verdict:</span>
                        "{rationale}"
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="text-xs text-muted-foreground">
                        Analyzed on {date}
                    </div>
                    <Link
                        href={`/stock/${symbol}`}
                        className="flex items-center text-xs font-medium text-primary hover:underline group/link"
                    >
                        Deep Dive
                        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Background Glow Effect */}
            <div className={cn(
                "absolute -inset-0.5 rounded-xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20",
                style.bg
            )} />
        </motion.div>
    );
}
