"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Target, CheckCircle, XCircle, AlertCircle, Activity, Building2, Newspaper, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";

export default function ResultAnalysisPage() {
    const params = useParams();
    const symbol = params.symbol as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/earnings-analysis`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (symbol) fetchDetails();
    }, [symbol]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="text-muted-foreground text-sm animate-pulse">Analyzing Financials...</div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center">Result analysis not found.</div>;

    const isBeat = data.verdict === 'BEAT';
    const isMiss = data.verdict === 'MISS';
    const verdictColor = isBeat ? 'text-green-500' : isMiss ? 'text-red-500' : 'text-yellow-500';
    const verdictBg = isBeat ? 'bg-green-500/10' : isMiss ? 'bg-red-500/10' : 'bg-yellow-500/10';
    const verdictBorder = isBeat ? 'border-green-500/20' : isMiss ? 'border-red-500/20' : 'border-yellow-500/20';

    // Prepare chart data
    const chartData = data.history.map((h: any) => ({
        name: h.period,
        Estimate: h.estimate,
        Actual: h.actual,
        full: h
    })).reverse();

    const formatCurrency = (val: number) => {
        if (!val && val !== 0) return '-';
        return `₹${(val / 1e7).toFixed(1)}Cr`;
    };

    const formatPercent = (val: number) => {
        if (!val && val !== 0) return '-';
        return `${(val * 100).toFixed(1)}%`;
    };

    const renderGrowth = (val: number) => {
        if (!val && val !== 0) return <span className="text-muted-foreground">-</span>;
        const isPos = val > 0;
        return (
            <span className={`flex items-center gap-1 font-medium ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(val * 100).toFixed(1)}%
            </span>
        );
    };

    const currentQtr = data.quarterly?.quarters?.[0];
    const growth = data.quarterly?.comparisons?.growth;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Apps Sidebar Integration */}
                <AppSidebar />

                {/* Main Content Area */}
                <div className="lg:col-span-10 space-y-8">

                    {/* Navbar / Top Bar */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Link href="/results" className="hover:text-primary flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Results Channel
                            </Link>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="font-semibold text-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {data.companyName}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                            <Share2 className="w-4 h-4" /> Share Analysis
                        </Button>
                    </div>

                    {/* HERO SECTION: Verdict & Key Impact */}
                    <div className={`relative overflow-hidden rounded-3xl border ${verdictBorder} bg-gradient-to-br from-card to-background p-8 md:p-10 shadow-xl`}>
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-64 h-64 ${verdictBg} blur-3xl rounded-full opacity-50 -mr-20 -mt-20 pointer-events-none`}></div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge variant="outline" className={`text-sm px-3 py-1 font-medium tracking-wide ${verdictBg} ${verdictColor} border-none`}>
                                        {data.latestQuarter?.period} RESULTS
                                    </Badge>
                                    <span className="text-xs font-mono text-muted-foreground">REPORTED TODAY</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
                                    {data.companyName}
                                </h1>
                                <div className="text-xl text-muted-foreground mb-6 flex items-center gap-2">
                                    <span className="font-mono">{data.symbol}</span>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                    <span>{data.price ? `₹${data.price.toFixed(2)}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 min-w-[140px]">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Revenue</div>
                                        <div className="text-2xl font-bold">{currentQtr ? formatCurrency(currentQtr.revenue) : formatCurrency(data.financials.revenue)}</div>
                                    </div>
                                    <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 min-w-[140px]">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Profit</div>
                                        <div className="text-2xl font-bold">{currentQtr ? formatCurrency(currentQtr.netIncome) : formatCurrency(data.financials.netIncome)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end text-center md:text-right">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-sm mb-6">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analyst Verdict</span>
                                </div>
                                <div className={`text-6xl font-black mb-2 flex items-center gap-4 ${verdictColor} drop-shadow-sm`}>
                                    {data.verdict}
                                    {isBeat && <CheckCircle className="w-16 h-16" />}
                                    {isMiss && <XCircle className="w-16 h-16" />}
                                    {!isBeat && !isMiss && <AlertCircle className="w-16 h-16" />}
                                </div>
                                <p className="text-lg font-medium text-muted-foreground">
                                    {data.surprisePercent > 0 ? 'Surpassed' : 'Missed'} street estimates by <span className={verdictColor}>{Math.abs(data.surprisePercent).toFixed(1)}%</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CORE METRICS: The "Scorecard" */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: Financial Performance Matrix */}
                        <Card className="md:col-span-2 border-none shadow-lg bg-card/40 backdrop-blur overflow-hidden">
                            <CardHeader className="bg-muted/10 border-b pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Result Scorecard
                                </CardTitle>
                                <CardDescription>Quarterly performance (Q3 FY25) compared to last quarter and last year.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/30">
                                                <th className="text-left p-4 font-semibold text-muted-foreground">Metric</th>
                                                <th className="text-right p-4 font-semibold text-muted-foreground">Reported (Cr)</th>
                                                <th className="text-right p-4 font-semibold text-muted-foreground">QoQ Growth</th>
                                                <th className="text-right p-4 font-semibold text-muted-foreground">YoY Growth</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {[
                                                { label: 'Revenue', val: currentQtr?.revenue, qoq: growth?.qoq?.revenue, yoy: growth?.yoy?.revenue },
                                                { label: 'EBITDA', val: currentQtr?.ebitda, qoq: growth?.qoq?.ebitda, yoy: growth?.yoy?.ebitda },
                                                { label: 'Net Profit', val: currentQtr?.netIncome, qoq: growth?.qoq?.netIncome, yoy: growth?.yoy?.netIncome },
                                                { label: 'EPS', val: currentQtr?.eps, valPrefix: '₹', qoq: growth?.qoq?.eps, yoy: growth?.yoy?.eps },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                    <td className="p-4 font-medium">{row.label}</td>
                                                    <td className="p-4 text-right font-bold font-mono text-base">
                                                        {row.valPrefix}{row.val ? (row.valPrefix ? row.val.toFixed(2) : (row.val / 1e7).toFixed(1)) : '-'}
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end">{renderGrowth(row.qoq)}</td>
                                                    <td className="p-4 text-right">{renderGrowth(row.yoy)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Margins Row Footer */}
                                <div className="grid grid-cols-3 divide-x border-t bg-muted/5">
                                    <div className="p-4 text-center">
                                        <div className="text-xs text-muted-foreground mb-1 uppercase">Op. Margin</div>
                                        <div className="font-bold text-lg">{formatPercent(currentQtr?.operatingMargin)}</div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <div className="text-xs text-muted-foreground mb-1 uppercase">Net Margin</div>
                                        <div className="font-bold text-lg">{formatPercent(currentQtr?.netProfitMargin)}</div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <div className="text-xs text-muted-foreground mb-1 uppercase">EPS (TTM)</div>
                                        <div className="font-bold text-lg">₹{data.financials.eps?.toFixed(2)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right: Expectation Chart */}
                        <Card className="border-none shadow-lg bg-card/40 backdrop-blur">
                            <CardHeader className="bg-muted/10 border-b pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="w-5 h-5 text-primary" />
                                    Street Estimates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-[200px] w-full mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="Actual" fill={isBeat ? "#22c55e" : "#ef4444"} radius={[4, 4, 0, 0]} barSize={20} />
                                            <Bar dataKey="Estimate" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-slate-400"></div> Estimate
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded ${isBeat ? 'bg-green-500' : 'bg-red-500'}`}></div> Actual
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BOARDROOM INSIGHTS */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
                            <Newspaper className="w-6 h-6 text-primary" />
                            Boardroom Insights & Coverage
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="h-full border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Company Business Summary</CardTitle>
                                    <CardDescription>Context on the company's operations and market position.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                        {data.description || "Company summary not available."}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="tex-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">Latest News & Analysis</h3>
                                {data.news && data.news.length > 0 ? (
                                    data.news.map((item: any, i: number) => (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="block group">
                                            <Card className="hover:border-primary/40 hover:bg-muted/10 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary shadow-sm">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div>
                                                            <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                                {item.title}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <span className="font-semibold text-primary/80">{item.publisher}</span>
                                                                <span>•</span>
                                                                <span>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </a>
                                    ))
                                ) : (
                                    <div className="p-8 text-center border rounded-xl bg-muted/10 text-muted-foreground italic">
                                        No recent news coverage needed.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
