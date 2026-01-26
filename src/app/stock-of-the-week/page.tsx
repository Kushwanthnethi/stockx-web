
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from "@/lib/config";
import { Loader2, TrendingUp, AlertTriangle, Target, DollarSign, Activity, Calendar, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";

// --- Helpers ---
const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(value);
};

// --- Subcomponents ---

const ConvictionGauge = ({ score }: { score: number }) => {
    // Determine color based on score
    let color = "#Eab308"; // Yellow (Warning)
    if (score >= 80) color = "#22c55e"; // Green (Strong)
    else if (score >= 60) color = "#34d399"; // Emerald (Good)

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
            {/* SVG Gauge */}
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="drop-shadow-glow"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl md:text-4xl font-black tracking-tighter"
                >
                    {score}
                </motion.span>
                <span className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground tracking-widest mt-1">
                    Conviction
                </span>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, subtext, delay }: { label: string; value: string; subtext?: string; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-lg p-3 md:p-4 flex flex-col gap-1 hover:bg-card/60 transition-colors"
    >
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">{value}</span>
        {subtext && <span className="text-[10px] text-muted-foreground">{subtext}</span>}
    </motion.div>
);

export default function StockOfTheWeekPage() {
    const [latest, setLatest] = useState<any>(null);
    const [archive, setArchive] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [latestRes, archiveRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/stocks/weekly/latest`),
                    fetch(`${API_BASE_URL}/stocks/weekly/archive`)
                ]);

                if (latestRes.ok) {
                    const text = await latestRes.text();
                    setLatest(text ? JSON.parse(text) : null);
                }
                if (archiveRes.ok) {
                    const text = await archiveRes.text();
                    setArchive(text ? JSON.parse(text) : []);
                }
            } catch (error) {
                console.error("Failed to fetch weekly stock", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Layout Wrapper
    return (
        <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar - Re-added to fix visibility issue */}
                <AppSidebar />

                {/* Main Content Area */}
                <main className="lg:col-span-10 space-y-10">

                    {/* Page Header */}
                    <div className="flex flex-col gap-2 border-b border-border/30 pb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px] font-bold py-1">
                                Weekly Intelligence
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Updated Sundays 12:00 PM
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black tracking-tight"
                        >
                            Stock of the <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Week</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-muted-foreground/80 max-w-3xl leading-relaxed"
                        >
                            Our highest conviction idea. Analyzed by AI, grounded in data, built for the week ahead.
                        </motion.p>
                    </div>

                    {/* Content Loading State */}
                    {loading && (
                        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-2xl bg-muted/5">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">Scanning the market universe...</p>
                        </div>
                    )}

                    {/* Active Pick Display */}
                    {!loading && latest && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-background shadow-2xl"
                        >
                            {/* Premium Grid Background Effect */}
                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 opacity-50" />

                            <div className="relative p-6 md:p-10 grid gap-12 md:grid-cols-12">

                                {/* Left Column: Identity & Gauge */}
                                <div className="md:col-span-5 flex flex-col gap-6 md:border-r border-border/50 md:pr-10">
                                    <div>
                                        <h2 className="text-6xl font-black tracking-tighter text-foreground leading-none mb-2">
                                            {latest.stockSymbol}
                                        </h2>
                                        <p className="text-xl font-medium text-muted-foreground truncate w-full">
                                            {latest.stock?.companyName}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4 flex-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Entry Price</span>
                                            <span className="text-3xl font-bold text-foreground">
                                                {formatINR(latest.priceAtSelection)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center py-4">
                                        <ConvictionGauge score={latest.convictionScore} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="flex flex-col p-3 rounded-lg bg-green-500/10 border border-green-500/10">
                                            <span className="text-[10px] font-bold uppercase text-green-500 mb-1">Target</span>
                                            <span className="font-mono font-bold text-lg">{formatINR(latest.targetPrice)}</span>
                                        </div>
                                        <div className="flex flex-col p-3 rounded-lg bg-red-500/10 border border-red-500/10">
                                            <span className="text-[10px] font-bold uppercase text-red-500 mb-1">Stop Loss</span>
                                            <span className="font-mono font-bold text-lg">{formatINR(latest.stopLoss)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Narrative & Logic */}
                                <div className="md:col-span-7 flex flex-col justify-between gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px bg-border flex-1" />
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Investment Thesis</span>
                                            <div className="h-px bg-border flex-1" />
                                        </div>

                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line font-light">
                                                {latest.narrative || "Analysis pending..."}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/40">
                                        <StatCard
                                            label="ROE"
                                            value={`${(latest.stock.returnOnEquity * 100).toFixed(1)}%`}
                                            delay={0.2}
                                            subtext="Efficiency"
                                        />
                                        <StatCard
                                            label="P/E Ratio"
                                            value={latest.stock.peRatio?.toFixed(1) || "-"}
                                            delay={0.3}
                                            subtext="Valuation"
                                        />
                                        <StatCard
                                            label="Market Cap"
                                            value={`${(latest.stock.marketCap / 10000000).toFixed(0)}Cr`}
                                            delay={0.4}
                                            subtext="Size"
                                        />
                                        <StatCard
                                            label="Trend"
                                            value={latest.stock.changePercent > 0 ? "Bullish" : "Bearish"}
                                            delay={0.5}
                                            subtext="Momentum"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!loading && !latest && (
                        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-muted/5">
                            <Activity className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">No active pick for this week</h3>
                            <p className="text-sm text-muted-foreground mt-1">Check back on Sunday at 12:00 PM.</p>
                        </div>
                    )}

                    {/* Archive Section */}
                    <div className="pt-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-muted-foreground" />
                                Performance Archive
                            </h3>
                        </div>

                        {archive.length > 0 ? (
                            <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Week</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Entry</th>
                                            <th className="px-6 py-4 text-right">Result</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {archive.map((pick: any) => {
                                            const pnl = pick.finalPrice ? ((pick.finalPrice - pick.priceAtSelection) / pick.priceAtSelection) * 100 : 0;
                                            return (
                                                <tr key={pick.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-muted-foreground">
                                                        {new Date(pick.weekStartDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-foreground">
                                                        {pick.stockSymbol}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                                        {formatINR(pick.priceAtSelection)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono">
                                                        {pick.finalPrice ? (
                                                            <span className={pnl >= 0 ? "text-green-500" : "text-red-500"}>
                                                                {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {pick.finalPrice ? (
                                                            <Badge variant="outline">Closed</Badge>
                                                        ) : (
                                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed rounded-xl border-border/50 text-muted-foreground text-sm">
                                Archive will populate after the next cycle.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
