"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    Briefcase, TrendingUp, TrendingDown, Plus, Upload, ArrowUpRight,
    ArrowDownRight, Trash2, Loader2, PieChart, Shield, Search, X,
    ChevronUp, ChevronDown, AlertTriangle, Sparkles, IndianRupee,
    BarChart3, Target, RefreshCw, Newspaper, ExternalLink
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
        insights: {
            summary?: string;
            strengths?: string[];
            weaknesses?: string[];
            recommendation?: string;
            scoringBreakdown?: {
                baselineScore: number;
                aiScore: number;
                finalScore: number;
                weights: {
                    quantitative: number;
                    ai: number;
                };
                factors: {
                    holdingsCount: number;
                    sectorCount: number;
                    maxWeightage: number;
                    top3Weightage: number;
                    totalPnlPercent: number;
                };
            };
        };
    } | null;
}

interface PortfolioNewsItem {
    uuid?: string;
    title: string;
    publisher?: string;
    link: string;
    providerPublishTime?: number | string | null;
    symbol: string;
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

function toDisplaySymbol(symbol: string) {
    return symbol.replace(/\.(NS|BO)$/i, '');
}

function getNewsTimestampMs(providerPublishTime: unknown): number | null {
    const ts = typeof providerPublishTime === "string"
        ? Number(providerPublishTime)
        : typeof providerPublishTime === "number"
            ? providerPublishTime
            : NaN;

    if (!Number.isFinite(ts) || ts <= 0) return null;
    return ts > 1000000000000 ? ts : ts * 1000;
}

function formatNewsTimeAgo(providerPublishTime: unknown): string | null {
    const timestampMs = getNewsTimestampMs(providerPublishTime);
    if (!timestampMs) return null;

    const date = new Date(timestampMs);
    if (Number.isNaN(date.getTime())) return null;

    try {
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return null;
    }
}

// ─── Content & Relevance helpers ──────────────────────────────────

type NewsSentiment = "bullish" | "bearish" | "neutral";

const BULLISH_KW = [
    "surge", "surges", "rally", "rallies", "gain", "gains", "rise", "rises",
    "jump", "jumps", "soar", "soars", "beat", "beats", "profit", "upgrade",
    "upgraded", "target raised", "record high", "strong", "breakout",
    "outperform", "accumulate", "growth", "expansion", "exceeds", "robust",
    "bullish", "upside", "momentum", "dividend", "order win", "new order",
    "contract win", "buy", "positive",
];
const BEARISH_KW = [
    "fall", "falls", "drop", "drops", "decline", "declines", "crash",
    "plunge", "plunges", "loss", "losses", "downgrade", "downgraded",
    "target cut", "weak", "miss", "misses", "below", "concern", "risk",
    "debt", "default", "penalty", "fine", "lawsuit", "investigation",
    "underperform", "sell", "negative", "bearish", "warning", "recall",
    "scandal", "fraud", "disappoints", "probe", "arbitration", "notice",
    "dispute", "slump", "slumps",
];

function getSentiment(title: string): NewsSentiment {
    const lower = title.toLowerCase();
    let b = 0, r = 0;
    for (const kw of BULLISH_KW) if (lower.includes(kw)) b++;
    for (const kw of BEARISH_KW) if (lower.includes(kw)) r++;
    if (b > r) return "bullish";
    if (r > b) return "bearish";
    return "neutral";
}

function isBreakingNews(providerPublishTime: unknown): boolean {
    const tsMs = getNewsTimestampMs(providerPublishTime);
    if (!tsMs) return false;
    return Date.now() - tsMs < 30 * 60 * 1000;
}

const NEWS_STOP_WORDS = new Set([
    "about", "above", "after", "ahead", "amid", "among", "around", "before",
    "below", "between", "despite", "during", "following", "given", "their",
    "there", "these", "those", "through", "under", "until", "using", "where",
    "which", "while", "within", "without", "would", "could", "should", "since",
    "still", "than", "also", "just", "more", "most", "over", "down", "will",
    "have", "been", "were", "that", "from", "they", "said", "says", "share",
    "shares", "stock", "stocks",
]);

function getTitleTokens(title: string): string[] {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 4 && !NEWS_STOP_WORDS.has(w))
        .slice(0, 8);
}

interface NewsGroup {
    id: string;
    primary: PortfolioNewsItem;
    others: PortfolioNewsItem[];
}

function groupNewsByStory(items: PortfolioNewsItem[]): NewsGroup[] {
    const groups: NewsGroup[] = [];
    const assigned = new Set<number>();
    items.forEach((item, i) => {
        if (assigned.has(i)) return;
        const tokensA = new Set(getTitleTokens(item.title));
        const group: NewsGroup = { id: item.uuid || item.link, primary: item, others: [] };
        items.forEach((other, j) => {
            if (j === i || assigned.has(j)) return;
            const shared = getTitleTokens(other.title).filter(t => tokensA.has(t)).length;
            if (shared >= 3) {
                group.others.push(other);
                assigned.add(j);
            }
        });
        assigned.add(i);
        groups.push(group);
    });
    return groups;
}

// ─── LiveHoldingRow ─────────────────────────────────────────────────
// Subscribes a single row for live price updates

interface LiveHoldingRowProps {
    holding: Holding;
    onRemove: (symbol: string) => void;
    onLiveValuesChange: (symbol: string, pnl: number, currentValue: number, todayPnl: number) => void;
}

function LiveHoldingRow({ holding, onRemove, onLiveValuesChange }: LiveHoldingRowProps) {
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

    // Today's P&L: how much this holding moved today
    const todayChangePercent = liveChangePercent ?? holding.stock.changePercent ?? 0;
    // Today's P&L = qty * previousClose * (changePercent/100)
    // previousClose = currentPrice / (1 + changePercent/100)
    const previousClose = todayChangePercent !== 0 ? currentPrice / (1 + todayChangePercent / 100) : currentPrice;
    const todayPnl = holding.quantity * (currentPrice - previousClose);
    const isTodayProfit = todayPnl >= 0;

    // Report live values to parent for aggregation
    useEffect(() => {
        onLiveValuesChange(holding.stockSymbol, pnl, currentValue, todayPnl);
    }, [pnl, currentValue, todayPnl, holding.stockSymbol]);

    return (
        <TableRow className="group hover:bg-muted/40 transition-colors">
            <TableCell>
                <Link href={`/stock/${holding.stockSymbol}`} className="flex items-center gap-3 group/link">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                            {toDisplaySymbol(holding.stockSymbol).substring(0, 3)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground group-hover/link:text-primary transition-colors flex items-center gap-1">
                            {toDisplaySymbol(holding.stockSymbol)}
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
            {/* Today's P&L Cell */}
            <TableCell className="text-right">
                <div className={cn("font-mono text-sm font-semibold tabular-nums", isTodayProfit ? "text-emerald-500" : "text-red-500")}>
                    {isTodayProfit ? "+" : ""}{formatCurrency(todayPnl)}
                </div>
                <div className={cn("text-[10px] font-mono tabular-nums", isTodayProfit ? "text-emerald-500/80" : "text-red-500/80")}>
                    {formatPercent(todayChangePercent)}
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
        try {
            await onAdd(symbol, parseFloat(quantity), parseFloat(avgPrice));
            setSymbol("");
            setQuantity("");
            setAvgPrice("");
            setSearchResults([]);
            setOpen(false);
        } catch (error: any) {
            alert(error?.message || "Unable to add stock. Please try again.");
        } finally {
            setLoading(false);
        }
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
                            value={toDisplaySymbol(symbol)}
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
                                            <div className="font-medium text-sm">{toDisplaySymbol(s.symbol)}</div>
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
    const [portfolioNews, setPortfolioNews] = useState<PortfolioNewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [newsLastUpdated, setNewsLastUpdated] = useState<Date | null>(null);
    const [newsFilter, setNewsFilter] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const toggleNewsGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // Live P&L aggregation: each row reports its live values here
    const livePnlMapRef = useRef<Map<string, { pnl: number; currentValue: number; todayPnl: number }>>(new Map());
    const [liveAggregated, setLiveAggregated] = useState({ totalPnl: 0, totalCurrentValue: 0, totalTodayPnl: 0 });

    const handleLiveValuesChange = useCallback((symbol: string, pnl: number, currentValue: number, todayPnl: number) => {
        const map = livePnlMapRef.current;
        const prev = map.get(symbol);
        // Only update if values actually changed (avoid unnecessary re-renders)
        if (prev && prev.pnl === pnl && prev.currentValue === currentValue && prev.todayPnl === todayPnl) return;
        map.set(symbol, { pnl, currentValue, todayPnl });
        // Aggregate
        let totalPnl = 0, totalCurrentValue = 0, totalTodayPnl = 0;
        map.forEach(v => { totalPnl += v.pnl; totalCurrentValue += v.currentValue; totalTodayPnl += v.todayPnl; });
        setLiveAggregated({ totalPnl, totalCurrentValue, totalTodayPnl });
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/portfolio");
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        // Reset live aggregation on refresh
        livePnlMapRef.current = new Map();
        setLiveAggregated({ totalPnl: 0, totalCurrentValue: 0, totalTodayPnl: 0 });
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
        const normalized = symbol.trim().toUpperCase();
        const response = await fetch(`${API_BASE_URL}/portfolios/holdings`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ symbol: normalized, quantity: qty, averageBuyPrice: avg }),
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Failed to add stock to portfolio");
        }
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

    const fetchPortfolioNews = useCallback(async (holdings: Holding[]) => {
        if (!holdings.length) {
            setPortfolioNews([]);
            setNewsError(null);
            return;
        }

        const symbols = [...holdings]
            .sort((a, b) => b.weightage - a.weightage)
            .slice(0, 8)
            .map((h) => h.stockSymbol);

        setNewsLoading(true);
        setNewsError(null);
        try {
            const responses = await Promise.allSettled(
                symbols.map((symbol) => fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/news`))
            );

            const merged: PortfolioNewsItem[] = [];

            for (let i = 0; i < responses.length; i++) {
                const res = responses[i];
                if (res.status !== "fulfilled" || !res.value.ok) continue;
                const raw = await res.value.json();
                if (!Array.isArray(raw)) continue;

                const symbol = toDisplaySymbol(symbols[i]);
                for (const item of raw) {
                    if (!item?.title || !item?.link) continue;
                    merged.push({
                        uuid: item.uuid,
                        title: item.title,
                        publisher: item.publisher,
                        link: item.link,
                        providerPublishTime: item.providerPublishTime,
                        symbol,
                    });
                }
            }

            const dedupedMap = new Map<string, PortfolioNewsItem>();
            for (const item of merged) {
                const key = item.uuid || item.link;
                if (!dedupedMap.has(key)) {
                    dedupedMap.set(key, item);
                }
            }

            const deduped = [...dedupedMap.values()]
                .sort((a, b) => (getNewsTimestampMs(b.providerPublishTime) || 0) - (getNewsTimestampMs(a.providerPublishTime) || 0))
                .slice(0, 12);

            setPortfolioNews(deduped);
            setNewsLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch portfolio news", error);
            setNewsError("Unable to load portfolio news right now.");
        } finally {
            setNewsLoading(false);
        }
    }, []);

    const groupedNews = useMemo(() => {
        const filtered = newsFilter
            ? portfolioNews.filter(n => n.symbol === newsFilter)
            : portfolioNews;
        return groupNewsByStory(filtered).slice(0, newsFilter ? 20 : 12);
    }, [portfolioNews, newsFilter]);

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

    useEffect(() => {
        if (!data?.holdings?.length) {
            setPortfolioNews([]);
            return;
        }

        fetchPortfolioNews(data.holdings);
        const refreshId = setInterval(() => {
            fetchPortfolioNews(data.holdings);
        }, 2 * 60 * 1000);

        return () => clearInterval(refreshId);
    }, [data?.holdings, fetchPortfolioNews]);

    if (authLoading) return null;

    const s = data?.summary;
    // Use live aggregated values when available, else fall back to backend values
    const hasLiveData = livePnlMapRef.current.size > 0;
    const effectiveTotalPnl = hasLiveData ? liveAggregated.totalPnl : (s?.totalPnl || 0);
    const effectiveTotalCurrentValue = hasLiveData ? liveAggregated.totalCurrentValue : (s?.totalCurrentValue || 0);
    const effectiveTotalPnlPercent = (s?.totalInvested || 0) > 0 ? (effectiveTotalPnl / s!.totalInvested) * 100 : 0;
    const effectiveTotalTodayPnl = liveAggregated.totalTodayPnl;
    const isProfit = effectiveTotalPnl >= 0;
    const isTodayProfit = effectiveTotalTodayPnl >= 0;
    const scoreBreakdown = data?.analysis?.insights?.scoringBreakdown;

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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
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
                                    {formatCurrency(effectiveTotalCurrentValue)}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                                    {isProfit ? "+" : ""}{formatCurrency(effectiveTotalPnl)}
                                </div>
                                <div className={cn(
                                    "text-xs font-mono tabular-nums mt-1 flex items-center gap-1",
                                    isProfit ? "text-emerald-500/80" : "text-red-500/80"
                                )}>
                                    {isProfit ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {formatPercent(effectiveTotalPnlPercent)}
                                </div>
                            </Card>

                            {/* Today's P&L */}
                            <Card className={cn(
                                "p-4 md:p-5 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow",
                                isTodayProfit
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-red-500/5 border-red-500/20"
                            )}>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    {isTodayProfit ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                    <span>Today{'\u0027'}s P&L</span>
                                </div>
                                <div className={cn(
                                    "text-lg md:text-xl font-bold font-mono tabular-nums",
                                    isTodayProfit ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {isTodayProfit ? "+" : ""}{formatCurrency(effectiveTotalTodayPnl)}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Intraday change
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
                                            {scoreBreakdown && (
                                                <div className="mt-1.5 space-y-1 text-[10px] text-muted-foreground">
                                                    <div className="font-mono tabular-nums">
                                                        Base {scoreBreakdown.baselineScore} | AI {scoreBreakdown.aiScore} | Final {scoreBreakdown.finalScore}
                                                    </div>
                                                    <div>
                                                        {scoreBreakdown.factors.holdingsCount} holdings, {scoreBreakdown.factors.sectorCount} sectors, Top3 {scoreBreakdown.factors.top3Weightage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            )}
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
                                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</TableHead>
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
                                                    <LiveHoldingRow key={h.id} holding={h} onRemove={handleRemove} onLiveValuesChange={handleLiveValuesChange} />
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

                        {/* ─── Portfolio News (Full Width) ─────────── */}
                        <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm">
                            <div className="p-4 border-b border-border/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Newspaper size={16} className="text-primary" />
                                        <h2 className="font-semibold">Portfolio News</h2>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">· Latest updates for your holdings</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {newsLastUpdated && (
                                            <span className="text-[11px] text-muted-foreground">
                                                Updated {newsLastUpdated.toLocaleTimeString()}
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => fetchPortfolioNews(data.holdings)}
                                            disabled={newsLoading}
                                        >
                                            {newsLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                        </Button>
                                    </div>
                                </div>
                                {portfolioNews.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        <button
                                            onClick={() => setNewsFilter(null)}
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                                                newsFilter === null
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-transparent text-muted-foreground border-border hover:bg-muted/60"
                                            )}
                                        >
                                            All
                                        </button>
                                        {Array.from(new Set(portfolioNews.map(n => n.symbol))).map(sym => (
                                            <button
                                                key={sym}
                                                onClick={() => setNewsFilter(newsFilter === sym ? null : sym)}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border transition-colors",
                                                    newsFilter === sym
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-transparent text-muted-foreground border-border hover:bg-muted/60"
                                                )}
                                            >
                                                {sym.replace('.NS', '')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                {newsLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="rounded-xl border border-border/40 p-3 space-y-2">
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-3 w-4/5" />
                                            </div>
                                        ))}
                                    </div>
                                ) : newsError ? (
                                    <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        {newsError}
                                    </div>
                                ) : portfolioNews.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-6 text-center">No recent portfolio-specific news available.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedNews.map((group) => {
                                            const item = group.primary;
                                            const sentiment = getSentiment(item.title);
                                            const breaking = isBreakingNews(item.providerPublishTime);
                                            const isExpanded = expandedGroups.has(group.id);
                                            return (
                                                <div
                                                    key={group.id}
                                                    className="flex flex-col rounded-xl border border-border/40 bg-muted/20 hover:border-primary/30 transition-all"
                                                >
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex flex-col p-3 flex-1"
                                                    >
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                            <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-mono shrink-0">
                                                                {item.symbol.replace('.NS', '').replace('.BO', '')}
                                                            </Badge>
                                                            {/* Sentiment tag */}
                                                            {sentiment === "bullish" && (
                                                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-500">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                                    Bullish
                                                                </span>
                                                            )}
                                                            {sentiment === "bearish" && (
                                                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-500">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                                                    Bearish
                                                                </span>
                                                            )}
                                                            {sentiment === "neutral" && (
                                                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                                                    Neutral
                                                                </span>
                                                            )}
                                                            {/* Breaking badge */}
                                                            {breaking && (
                                                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                                                    NEW
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-muted-foreground truncate flex-1">
                                                                {item.publisher || "Market News"}
                                                            </span>
                                                            {(() => {
                                                                const timeAgo = formatNewsTimeAgo(item.providerPublishTime);
                                                                if (!timeAgo) return null;
                                                                return (
                                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                                        {timeAgo}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                        <p className="text-xs font-medium leading-snug line-clamp-3 flex-1 group-hover:text-primary transition-colors">
                                                            {item.title}
                                                        </p>
                                                        <div className="mt-2.5 flex items-center gap-1 text-[10px] text-primary font-medium">
                                                            Read more
                                                            <ExternalLink size={9} />
                                                        </div>
                                                    </a>
                                                    {/* Same-story grouped articles */}
                                                    {group.others.length > 0 && (
                                                        <div className="border-t border-border/30">
                                                            <button
                                                                onClick={() => toggleNewsGroup(group.id)}
                                                                className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                {isExpanded
                                                                    ? <ChevronUp size={10} />
                                                                    : <ChevronDown size={10} />}
                                                                {isExpanded
                                                                    ? "Show less"
                                                                    : `+${group.others.length} more source${group.others.length > 1 ? "s" : ""} covering this story`}
                                                            </button>
                                                            {isExpanded && (
                                                                <div className="px-3 pb-2 space-y-1 border-t border-border/20">
                                                                    {group.others.map((o, oi) => {
                                                                        const oSentiment = getSentiment(o.title);
                                                                        return (
                                                                            <a
                                                                                key={oi}
                                                                                href={o.link}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                                                            >
                                                                                {oSentiment === "bullish" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                                                                {oSentiment === "bearish" && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
                                                                                {oSentiment === "neutral" && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />}
                                                                                <span className="truncate flex-1">{o.publisher || "Market News"}</span>
                                                                                <ExternalLink size={9} className="shrink-0" />
                                                                            </a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </>
                )}
            </main>
        </div>
    );
}
