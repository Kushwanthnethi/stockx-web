"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Clock, Calendar, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Types
interface SearchResult {
    symbol: string;
    shortname: string;
    exchange: string;
    quoteType: string;
    isYahooFinance: boolean;
}

interface TrendingResult {
    symbol: string;
    companyName: string;
    exchange: string;
    currentPrice: number;
    changePercent: number;
}

type NavItem =
    | { type: 'recent'; id: string; symbol: string }
    | { type: 'suggest'; id: string; label: string; href: string; icon: React.ReactNode }
    | { type: 'trending'; id: string; data: TrendingResult }
    | { type: 'result'; id: string; data: SearchResult };

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [trending, setTrending] = React.useState<TrendingResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [recents, setRecents] = React.useState<string[]>([]);
    const [mounted, setMounted] = React.useState(false);

    // Keyboard Navigation State
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    // Flattened list of visible items for keyboard navigation
    const [visibleItems, setVisibleItems] = React.useState<NavItem[]>([]);

    // Refs for scrolling
    const listRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Initial Load
    React.useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("stockx_recent_searches");
        if (saved) {
            try { setRecents(JSON.parse(saved)); } catch (e) { console.error(e); }
        }

        fetch("http://localhost:3333/stocks/trending")
            .then(res => res.json())
            .then(data => setTrending(data.slice(0, 3)))
            .catch(err => console.error("Failed to load trending", err));
    }, []);

    // Toggle with Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Focus input on open
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
        }
    }, [open]);

    // Search Logic
    React.useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3333/stocks/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setSelectedIndex(0); // Reset selection on new results
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Construct Visible Items List (Derived State)
    React.useEffect(() => {
        let items: NavItem[] = [];

        if (query.length >= 2) {
            // Search Mode
            items = results.map(r => ({ type: 'result', id: r.symbol, data: r }));
        } else {
            // Default Mode
            items = [
                ...recents.map(r => ({ type: 'recent', id: `recent-${r}`, symbol: r } as NavItem)),
                { type: 'suggest', id: 'dash', label: 'Dashboard', href: '/dashboard', icon: <TrendingUp className="mr-2 h-4 w-4" /> },
                { type: 'suggest', id: 'cal', label: 'Earnings Calendar', href: '/calendar', icon: <Calendar className="mr-2 h-4 w-4" /> },
                ...trending.map(t => ({ type: 'trending', id: `trend-${t.symbol}`, data: t } as NavItem))
            ];
        }
        setVisibleItems(items);
    }, [query, results, recents, trending]);

    // Save Recent Helper
    const addToRecents = (symbol: string) => {
        const newRecents = [symbol, ...recents.filter(r => r !== symbol)].slice(0, 5);
        setRecents(newRecents);
        localStorage.setItem("stockx_recent_searches", JSON.stringify(newRecents));
    };

    // Navigation Helper
    const navigateTo = (item: NavItem) => {
        setOpen(false);
        if (item.type === 'result') {
            addToRecents(item.data.symbol);
            router.push(`/stock/${item.data.symbol}`);
        } else if (item.type === 'recent') {
            addToRecents(item.symbol);
            router.push(`/stock/${item.symbol}`);
        } else if (item.type === 'trending') {
            addToRecents(item.data.symbol);
            router.push(`/stock/${item.data.symbol}`);
        } else if (item.type === 'suggest') {
            router.push(item.href);
        }
    };

    // Keyboard Handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (visibleItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % visibleItems.length);
            // Scroll logic could go here
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + visibleItems.length) % visibleItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            navigateTo(visibleItems[selectedIndex]);
        }
    };

    // Scroll active item into view
    React.useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);


    if (!mounted) return null;

    return (
        <>
            {/* Trigger Button - Unchanged style */}
            <button
                onClick={() => setOpen(true)}
                className="relative inline-flex h-9 w-full min-w-[200px] md:w-[300px] lg:w-[400px] items-center justify-start rounded-[0.5rem] border border-input bg-muted/20 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12"
            >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <span className="hidden lg:inline-flex">Search stocks...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-xl duration-200">
                    <DialogTitle className="sr-only">Search Stocks</DialogTitle>
                    <div className="flex flex-col h-full w-full bg-popover text-popover-foreground">
                        {/* Search Input Header */}
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                ref={inputRef}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {loading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
                        </div>

                        {/* List Content */}
                        <div
                            ref={listRef}
                            className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2"
                        >
                            {visibleItems.length === 0 && !loading && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No results found.
                                </div>
                            )}

                            {/* Render Items */}
                            {query.length < 2 && recents.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">Recent Searches</h3>
                                    {recents.map((symbol, idx) => {
                                        // Calculate global index relative to VisibleItems
                                        const globalIndex = visibleItems.findIndex(i => i.type === 'recent' && i.symbol === symbol);
                                        return (
                                            <Item
                                                key={symbol}
                                                active={selectedIndex === globalIndex}
                                                data-index={globalIndex}
                                                onClick={() => navigateTo(visibleItems[globalIndex])}
                                            >
                                                <Clock className="mr-2 h-4 w-4 opacity-70" />
                                                <span>{symbol}</span>
                                            </Item>
                                        )
                                    })}
                                </div>
                            )}

                            {query.length < 2 && (
                                <div className="mb-2">
                                    <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">Suggestions</h3>
                                    {visibleItems.filter(i => i.type === 'suggest').map((item: any) => {
                                        const globalIndex = visibleItems.indexOf(item);
                                        return (
                                            <Item
                                                key={item.id}
                                                active={selectedIndex === globalIndex}
                                                data-index={globalIndex}
                                                onClick={() => navigateTo(item)}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Item>
                                        )
                                    })}
                                </div>
                            )}

                            {query.length < 2 && trending.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">Trending Now</h3>
                                    {trending.map((stock) => {
                                        const globalIndex = visibleItems.findIndex(i => i.type === 'trending' && i.data.symbol === stock.symbol);
                                        return (
                                            <div
                                                key={stock.symbol}
                                                data-index={globalIndex}
                                                onClick={() => navigateTo(visibleItems[globalIndex])}
                                                className={cn(
                                                    "flex cursor-pointer items-center justify-between rounded-lg border bg-card p-3 my-1 transition-colors hover:bg-accent",
                                                    selectedIndex === globalIndex ? "bg-accent text-accent-foreground" : ""
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-full bg-muted",
                                                        stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                                                    )}>
                                                        <TrendingUp className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{stock.symbol}</div>
                                                        <div className="text-xs text-muted-foreground">{stock.companyName}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">₹{stock.currentPrice.toFixed(2)}</div>
                                                    <div className={cn("text-xs", stock.changePercent >= 0 ? "text-green-500" : "text-red-500")}>
                                                        {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {query.length >= 2 && (
                                <div className="mb-2">
                                    <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">Stocks</h3>
                                    {results.map((item) => {
                                        const globalIndex = visibleItems.findIndex(i => i.type === 'result' && i.data.symbol === item.symbol);
                                        return (
                                            <Item
                                                key={item.symbol}
                                                active={selectedIndex === globalIndex}
                                                data-index={globalIndex}
                                                onClick={() => navigateTo(visibleItems[globalIndex])}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-semibold">{item.symbol}</span>
                                                        <span className="text-xs text-muted-foreground">{item.shortname}</span>
                                                    </div>
                                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.exchange}</span>
                                                </div>
                                            </Item>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Simple Helper Component for standard Items
function Item({ children, active, onClick, ...props }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            )}
            {...props}
        >
            {children}
        </div>
    )
}
