"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
    Briefcase, TrendingUp, TrendingDown, Plus, Upload, ArrowUpRight,
    ArrowDownRight, Trash2, Loader2, PieChart, Shield, Search, X,
    ChevronUp, ChevronDown, AlertTriangle, Sparkles, IndianRupee,
    BarChart3, Target, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLivePrice } from "@/hooks/use-live-price";

// ─── Types ──────────────────────────────────────────────────────────

interface Holding {
    id: string;
    stockSymbol: string;
    quantity: number;
    averageBuyPrice: number;
    investedValue: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
    weightage: number;
    stock: {
        symbol: string;
        companyName: string;
        currentPrice: number | null;
        changePercent: number | null;
        sector: string | null;
        exchange: string;
    };
}

interface SectorData {
    name: string;
    value: number;
    percentage: number;
}

interface PortfolioData {
    portfolioId: string;
    portfolioName: string;
    summary: {
        totalInvested: number;
        totalCurrentValue: number;
        totalPnl: number;
        totalPnlPercent: number;
        holdingsCount: number;
        dayChange: number;
    };
    holdings: Holding[];
    sectors: SectorData[];
    analysis: {
        healthScore: number;
        riskLevel: string;
        insights: any;
    } | null;
}

// ─── Color palette for sector chart ─────────────────────────────────

const SECTOR_COLORS = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6", "#818cf8", "#c084fc",
];

// ─── Helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number) {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// ─── LiveHoldingRow ─────────────────────────────────────────────────
// Subscribes a single row for live price updates

function LiveHoldingRow({ holding, onRemove }: { holding: Holding; onRemove: (symbol: string) => void }) {
    const { price: livePrice, changePercent: liveChangePercent, flash } = useLivePrice({
        symbol: holding.stockSymbol,
        initialPrice: holding.stock.currentPrice || holding.averageBuyPrice,
        initialChangePercent: holding.stock.changePercent || 0
    });

    const currentPrice = livePrice || holding.averageBuyPrice;
    const currentValue = holding.quantity * currentPrice;
    const pnl = currentValue - holding.investedValue;
    const pnlPercent = holding.investedValue > 0 ? (pnl / holding.investedValue) * 100 : 0;
    const isProfit = pnl >= 0;

    return (
        <TableRow className="group hover:bg-muted/40 transition-colors">
            <TableCell>
                <Link href={`/stock/${holding.stockSymbol}`} className="flex items-center gap-3 group/link">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                            {holding.stockSymbol.replace('.NS', '').substring(0, 3)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground group-hover/link:text-primary transition-colors flex items-center gap-1">
                            {holding.stockSymbol.replace('.NS', '')}
                            <ArrowUpRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {holding.stock.companyName}
                        </div>
                    </div>
                </Link>
            </TableCell>
            <TableCell className="text-right font-mono text-sm tabular-nums">
                {holding.quantity}
            </TableCell>
            <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                ₹{holding.averageBuyPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-right">
                <div className={cn("font-mono text-sm font-medium tabular-nums transition-colors duration-300", flash === 'up' ? 'text-emerald-500' : flash === 'down' ? 'text-red-500' : '')}>
                    ₹{currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
                {liveChangePercent !== null && (
                    <div className={cn(
                        "text-[10px] font-mono tabular-nums",
                        liveChangePercent >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {formatPercent(liveChangePercent)}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatCurrency(holding.investedValue)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm tabular-nums font-medium">
                {formatCurrency(currentValue)}
            </TableCell>
            <TableCell className="text-right">
                <div className={cn("font-mono text-sm font-semibold tabular-nums", isProfit ? "text-emerald-500" : "text-red-500")}>
                    {isProfit ? "+" : ""}{formatCurrency(pnl)}
                </div>
                <div className={cn("text-[10px] font-mono tabular-nums", isProfit ? "text-emerald-500/80" : "text-red-500/80")}>
                    {formatPercent(pnlPercent)}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                            style={{ width: `${Math.min(holding.weightage, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground w-10 text-right">
                        {holding.weightage.toFixed(1)}%
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                    onClick={(e) => { e.stopPropagation(); onRemove(holding.stockSymbol); }}
                >
                    <Trash2 size={14} />
                </Button>
            </TableCell>
        </TableRow>
    );
}

// ─── Sector Donut Chart (pure SVG) ──────────────────────────────────

function SectorDonut({ sectors, total }: { sectors: SectorData[]; total: number }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    if (sectors.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No sector data
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <svg width="180" height="180" viewBox="0 0 180 180">
                    {sectors.map((sector, i) => {
                        const pct = sector.percentage;
                        const offset = cumulativePercent;
                        cumulativePercent += pct;
                        return (
                            <circle
                                key={sector.name}
                                cx="90"
                                cy="90"
                                r={radius}
                                fill="none"
                                stroke={SECTOR_COLORS[i % SECTOR_COLORS.length]}
                                strokeWidth="20"
                                strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                                strokeDashoffset={-(offset / 100) * circumference}
                                transform="rotate(-90 90 90)"
                                className="transition-all duration-500"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{sectors.length}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sectors</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full max-w-xs">
                {sectors.slice(0, 8).map((sector, i) => (
                    <div key={sector.name} className="flex items-center gap-2 text-xs">
                        <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                        />
                        <span className="truncate text-muted-foreground">{sector.name}</span>
                        <span className="ml-auto font-mono tabular-nums text-foreground">{sector.percentage.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Add Stock Dialog ───────────────────────────────────────────────

function AddStockDialog({ onAdd }: { onAdd: (symbol: string, qty: number, avg: number) => Promise<void> }) {
    const [open, setOpen] = useState(false);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState("");
    const [avgPrice, setAvgPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const searchStocks = async (query: string) => {
        if (query.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.slice(0, 6));
            }
        } catch { }
        setSearching(false);
    };

    const handleSubmit = async () => {
        if (!symbol || !quantity || !avgPrice) return;
        setLoading(true);
        await onAdd(symbol, parseFloat(quantity), parseFloat(avgPrice));
        setLoading(false);
        setSymbol("");
        setQuantity("");
        setAvgPrice("");
        setSearchResults([]);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 rounded-xl">
                    <Plus size={16} />
                    Add Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Plus size={16} className="text-primary" />
                        </div>
                        Add Stock to Portfolio
                    </DialogTitle>
                    <DialogDescription>
                        Search for a stock and enter your holding details.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search stock (e.g. RELIANCE)"
                            className="pl-9 bg-muted/50"
                            value={symbol.replace('.NS', '')}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setSymbol(val);
                                searchStocks(val);
                            }}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                                {searchResults.map((s: any) => (
                                    <button
                                        key={s.symbol}
                                        className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between"
                                        onClick={() => { setSymbol(s.symbol); setSearchResults([]); }}
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{s.symbol.replace('.NS', '')}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.companyName}</div>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            ₹{s.currentPrice?.toLocaleString() || '—'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                            <Input
                                type="number"
                                placeholder="10"
                                className="bg-muted/50"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Avg Buy Price (₹)</label>
                            <Input
                                type="number"
                                placeholder="2500"
                                className="bg-muted/50"
                                value={avgPrice}
                                onChange={(e) => setAvgPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    {symbol && quantity && avgPrice && (
                        <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-sm space-y-1">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Investment</span>
                                <span className="font-mono font-medium text-foreground">
                                    ₹{(parseFloat(quantity) * parseFloat(avgPrice)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}
                    <Button
                        className="w-full gap-2 rounded-xl"
                        onClick={handleSubmit}
                        disabled={loading || !symbol || !quantity || !avgPrice}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {loading ? "Adding..." : "Add to Portfolio"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<string>("weightage");
    const [sortAsc, setSortAsc] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/portfolio");
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/portfolios/holdings?_t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
                next: { revalidate: 0 }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Failed to fetch portfolio", err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [user]);

    const handleAdd = async (symbol: string, qty: number, avg: number) => {
        const token = localStorage.getItem("accessToken");
        const sym = symbol.endsWith('.NS') ? symbol : symbol + '.NS';
        await fetch(`${API_BASE_URL}/portfolios/holdings`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ symbol: sym, quantity: qty, averageBuyPrice: avg }),
        });
        await fetchData();
    };

    const handleRemove = async (symbol: string) => {
        const token = localStorage.getItem("accessToken");
        await fetch(`${API_BASE_URL}/portfolios/holdings/${encodeURIComponent(symbol)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        await fetchData();
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/portfolios/analyze?_t=${Date.now()}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Fetch new data with explicit delay to allow DB commit
                setTimeout(async () => {
                    await fetchData();
                    setAnalyzing(false);
                }, 500);
                return;
            } else {
                console.error("Analysis failed", await res.text());
            }
        } catch (err) {
            console.error("Failed to analyze", err);
        }
        setAnalyzing(false);
    };

    const sortedHoldings = useMemo(() => {
        if (!data) return [];
        const sorted = [...data.holdings].sort((a, b) => {
            let av: number, bv: number;
            switch (sortKey) {
                case "pnl": av = a.pnl; bv = b.pnl; break;
                case "pnlPercent": av = a.pnlPercent; bv = b.pnlPercent; break;
                case "investedValue": av = a.investedValue; bv = b.investedValue; break;
                case "currentValue": av = a.currentValue; bv = b.currentValue; break;
                case "weightage": av = a.weightage; bv = b.weightage; break;
                case "symbol": return sortAsc
                    ? a.stockSymbol.localeCompare(b.stockSymbol)
                    : b.stockSymbol.localeCompare(a.stockSymbol);
                default: av = a.weightage; bv = b.weightage;
            }
            return sortAsc ? av - bv : bv - av;
        });
        return sorted;
    }, [data, sortKey, sortAsc]);

    const toggleSort = (key: string) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(false); }
    };

    const SortIcon = ({ col }: { col: string }) => (
        sortKey === col ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null
    );

    if (authLoading) return null;

    const s = data?.summary;
    const isProfit = (s?.totalPnl || 0) >= 0;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* ─── Page Header ────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                            <Briefcase size={22} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">My Portfolio</h1>
                            <p className="text-sm text-muted-foreground">Track your investments in real-time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={fetchData}>
                            <RefreshCw size={14} />
                            Refresh
                        </Button>
                        <AddStockDialog onAdd={handleAdd} />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-32" />
                            </Card>
                        ))}
                    </div>
                ) : !data || data.holdings.length === 0 ? (
                    /* ─── Empty State ───────────────────────────────── */
                    <Card className="border-dashed border-2 bg-card/30">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <Briefcase size={40} className="text-primary/60" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Plus size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <h3 className="text-xl font-bold">Start Building Your Portfolio</h3>
                                <p className="text-muted-foreground text-sm">
                                    Add your first stock to begin tracking your investments with real-time P&L, sector analysis, and AI insights.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <AddStockDialog onAdd={handleAdd} />
                            </div>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* ─── Summary Cards ─────────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {/* Invested */}
                            <Card className="p-4 md:p-5 bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <IndianRupee size={12} />
                                    <span>Total Invested</span>
                                </div>
                                <div className="text-lg md:text-xl font-bold font-mono tabular-nums">
                                    {formatCurrency(s!.totalInvested)}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    {s!.holdingsCount} stocks
                                </div>
                            </Card>

                            {/* Current Value */}
                            <Card className="p-4 md:p-5 bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <BarChart3 size={12} />
                                    <span>Current Value</span>
                                </div>
                                <div className="text-lg md:text-xl font-bold font-mono tabular-nums">
                                    {formatCurrency(s!.totalCurrentValue)}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Live market value
                                </div>
                            </Card>

                            {/* Total P&L */}
                            <Card className={cn(
                                "p-4 md:p-5 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow",
                                isProfit
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-red-500/5 border-red-500/20"
                            )}>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    {isProfit ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                    <span>Total P&L</span>
                                </div>
                                <div className={cn(
                                    "text-lg md:text-xl font-bold font-mono tabular-nums",
                                    isProfit ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {isProfit ? "+" : ""}{formatCurrency(s!.totalPnl)}
                                </div>
                                <div className={cn(
                                    "text-xs font-mono tabular-nums mt-1 flex items-center gap-1",
                                    isProfit ? "text-emerald-500/80" : "text-red-500/80"
                                )}>
                                    {isProfit ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {formatPercent(s!.totalPnlPercent)}
                                </div>
                            </Card>

                            {/* AI Health Score */}
                            <Card className="p-4 md:p-5 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Sparkles size={12} className="text-violet-500" />
                                    <span>Health Score</span>
                                </div>
                                {data.analysis ? (
                                    <div className="flex flex-col items-start h-[calc(100%-24px)] justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-lg md:text-xl font-bold font-mono tabular-nums text-violet-600 dark:text-violet-400">
                                                    {data.analysis.healthScore}/100
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px]",
                                                    data.analysis.riskLevel === 'LOW' && "border-emerald-500/30 text-emerald-500",
                                                    data.analysis.riskLevel === 'MEDIUM' && "border-amber-500/30 text-amber-500",
                                                    data.analysis.riskLevel === 'CRITICAL' && "border-red-500/30 text-red-500",
                                                )}>
                                                    {data.analysis.riskLevel} RISK
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-full text-[10px] gap-1 px-2 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 mt-2"
                                            onClick={handleAnalyze}
                                            disabled={analyzing || data.holdings.length === 0}
                                        >
                                            {analyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            {analyzing ? "Analyzing..." : "Re-Analyze Portfolio"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start gap-1 mt-1">
                                        <div className="text-lg md:text-xl font-bold text-muted-foreground/50">—</div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-[10px] gap-1 px-2 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 mt-1"
                                            onClick={handleAnalyze}
                                            disabled={analyzing || data.holdings.length === 0}
                                        >
                                            {analyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            {analyzing ? "Analyzing..." : "Analyze Portfolio"}
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* ─── Main Content Grid ─────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Holdings Table (spans 2 cols) */}
                            <div className="lg:col-span-2">
                                <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target size={16} className="text-primary" />
                                            <h2 className="font-semibold">Holdings</h2>
                                            <Badge variant="secondary" className="text-[10px] ml-1">
                                                {data.holdings.length}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                    <TableHead className="w-[180px]">
                                                        <button onClick={() => toggleSort("symbol")} className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                            Stock <SortIcon col="symbol" />
                                                        </button>
                                                    </TableHead>
                                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty</TableHead>
                                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Price</TableHead>
                                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">CMP</TableHead>
                                                    <TableHead className="text-right">
                                                        <button onClick={() => toggleSort("investedValue")} className="flex items-center gap-1 ml-auto font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                            Invested <SortIcon col="investedValue" />
                                                        </button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <button onClick={() => toggleSort("currentValue")} className="flex items-center gap-1 ml-auto font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                            Current <SortIcon col="currentValue" />
                                                        </button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <button onClick={() => toggleSort("pnl")} className="flex items-center gap-1 ml-auto font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                            P&L <SortIcon col="pnl" />
                                                        </button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <button onClick={() => toggleSort("weightage")} className="flex items-center gap-1 ml-auto font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                            Weight <SortIcon col="weightage" />
                                                        </button>
                                                    </TableHead>
                                                    <TableHead className="w-8" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedHoldings.map((h) => (
                                                    <LiveHoldingRow key={h.id} holding={h} onRemove={handleRemove} />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Sector Allocation */}
                                <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <PieChart size={16} className="text-primary" />
                                        <h2 className="font-semibold text-sm">Sector Allocation</h2>
                                    </div>
                                    <SectorDonut sectors={data.sectors} total={s!.totalCurrentValue} />
                                </Card>

                                {/* Top Performers */}
                                <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp size={16} className="text-emerald-500" />
                                        <h2 className="font-semibold text-sm">Top Performers</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {[...data.holdings]
                                            .sort((a, b) => b.pnlPercent - a.pnlPercent)
                                            .slice(0, 4)
                                            .map((h) => (
                                                <Link key={h.id} href={`/stock/${h.stockSymbol}`} className="flex items-center justify-between group hover:bg-muted/30 rounded-lg p-1.5 -mx-1.5 transition-colors">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                {h.stockSymbol.replace('.NS', '').substring(0, 3)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium">{h.stockSymbol.replace('.NS', '')}</div>
                                                            <div className="text-[10px] text-muted-foreground">{formatCurrency(h.currentValue)}</div>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-mono font-semibold tabular-nums",
                                                        h.pnlPercent >= 0 ? "text-emerald-500" : "text-red-500"
                                                    )}>
                                                        {formatPercent(h.pnlPercent)}
                                                    </span>
                                                </Link>
                                            ))}
                                    </div>
                                </Card>

                                {/* Worst Performers */}
                                {data.holdings.some(h => h.pnl < 0) && (
                                    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                            <h2 className="font-semibold text-sm">Underperformers</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {[...data.holdings]
                                                .filter(h => h.pnl < 0)
                                                .sort((a, b) => a.pnlPercent - b.pnlPercent)
                                                .slice(0, 4)
                                                .map((h) => (
                                                    <Link key={h.id} href={`/stock/${h.stockSymbol}`} className="flex items-center justify-between group hover:bg-muted/30 rounded-lg p-1.5 -mx-1.5 transition-colors">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center">
                                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                                                                    {h.stockSymbol.replace('.NS', '').substring(0, 3)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-medium">{h.stockSymbol.replace('.NS', '')}</div>
                                                                <div className="text-[10px] text-muted-foreground">{formatCurrency(h.currentValue)}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-mono font-semibold tabular-nums text-red-500">
                                                            {formatPercent(h.pnlPercent)}
                                                        </span>
                                                    </Link>
                                                ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
