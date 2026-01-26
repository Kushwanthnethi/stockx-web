
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from "@/lib/config";
import { Loader2, TrendingUp, AlertTriangle, Target, DollarSign, Activity, Calendar, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 md:p-6 flex flex-col gap-2 hover:bg-card/80 transition-colors"
    >
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <span className="text-xl md:text-2xl font-bold tracking-tight">{value}</span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container max-w-6xl mx-auto px-4 py-8 space-y-12">

                {/* Header Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/30 pb-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-full px-3">
                                Weekly Intelligence
                            </Badge>
                            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Updated Sundays 12:00 PM
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Stock of the <span className="text-primary">Week</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Our highest conviction idea. Analyzed by AI, grounded in data, built for the week ahead.
                        </p>
                    </div>
                </motion.div>

                {/* Hero Section: The Pick */}
                {!latest ? (
                    <Card className="border-dashed h-64 flex items-center justify-center text-center">
                        <div className="space-y-2">
                            <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">Market Scanning in Progress...</p>
                        </div>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        {/* THE GOLDEN CARD */}
                        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-background shadow-2xl">
                            {/* Decorative Top Banner */}
                            <div className="h-2 w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />

                            <div className="p-6 md:p-10 grid gap-10 md:grid-cols-12">

                                {/* Left: Ticker & Gauge */}
                                <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left gap-6 border-b md:border-b-0 md:border-r border-border/50 pb-8 md:pb-0 md:pr-8">
                                    <div className="space-y-1">
                                        <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">
                                            {latest.stockSymbol}
                                        </h2>
                                        <p className="text-xl md:text-2xl font-medium text-muted-foreground truncate max-w-[280px]">
                                            {latest.stock?.companyName}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl w-full justify-center md:justify-start">
                                        <span className="text-3xl font-bold flex items-baseline gap-1">
                                            {formatINR(latest.priceAtSelection)}
                                            <span className="text-xs font-normal text-muted-foreground uppercase ml-1">Entry</span>
                                        </span>
                                    </div>

                                    <div className="mt-2 w-full flex justify-center md:justify-start">
                                        <ConvictionGauge score={latest.convictionScore} />
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                                            <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Target</div>
                                            <div className="font-mono font-bold">{formatINR(latest.targetPrice)}</div>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                                            <div className="text-xs text-red-600 dark:text-red-400 font-bold uppercase mb-1">Stop Loss</div>
                                            <div className="font-mono font-bold">{formatINR(latest.stopLoss)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Narrative & Stats */}
                                <div className="md:col-span-7 flex flex-col gap-8">

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-1 bg-primary rounded-full" />
                                            <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">The Thesis</h3>
                                        </div>
                                        <div className="prose prose-lg prose-invert max-w-none text-foreground/90 leading-relaxed font-light">
                                            {latest.narrative?.split('\n').map((line: string, i: number) => (
                                                <p key={i} className="mb-4">{line}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mini Logic Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-auto">
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
                                            label="Momentum"
                                            value={latest.stock.changePercent > 0 ? "+ Bullish" : "Neutral"}
                                            delay={0.5}
                                            subtext="Trend"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <Separator className="bg-border/50" />

                {/* Archive Table */}
                {archive.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold tracking-tight">Performance Archive</h3>
                            <Button variant="outline" size="sm" className="hidden md:flex">View Methodology</Button>
                        </div>

                        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border/40">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-xs">Date</th>
                                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-xs">Asset</th>
                                        <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-xs">Entry Price</th>
                                        <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-xs">Result</th>
                                        <th className="px-6 py-4 text-center font-semibold text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {archive.map((pick: any, i) => {
                                        const pnl = pick.finalPrice ? ((pick.finalPrice - pick.priceAtSelection) / pick.priceAtSelection) * 100 : 0;
                                        return (
                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={pick.id}
                                                className="group hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-muted-foreground font-medium">
                                                    {new Date(pick.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{pick.stockSymbol}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                                    {formatINR(pick.priceAtSelection)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono">
                                                    {pick.finalPrice ? (
                                                        <span className={pnl >= 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                                            {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {pick.finalPrice ? (
                                                        <Badge variant="outline" className="border-border text-muted-foreground">Closed</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Added imports here to be safe if they were missing before, 
// though typically imports are at the top. 
// Just ensuring `Button` is imported for the archive section above.
import { Button } from "@/components/ui/button";
