
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WatchButton } from "@/components/features/stocks/watch-button";
import { Calendar, ChevronRight, TrendingUp, Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EarningEvent {
    symbol: string;
    companyName: string;
    formattedDate: string;
    date: string; // ISO string from backend
    revenue?: number;
    profit?: number;
    eps?: number;
    revenueGrowth?: number;
    pdfUrl?: string; // New field
}

export function ResultsCalendar() {
    const [events, setEvents] = useState<EarningEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const res = await fetch('http://localhost:3333/stocks/earnings-calendar');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch earnings calendar", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, []);

    const filteredEvents = events.filter(e =>
        e.companyName.toLowerCase().includes(filter.toLowerCase()) ||
        e.symbol.toLowerCase().includes(filter.toLowerCase())
    );

    // Grouping Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups: Record<string, EarningEvent[]> = {
        "Recent": [], // Moved to top logic (though object key order doesn't matter, array below does)
        "Today": [],
        "Tomorrow": [],
        "This Week": [],
        "Upcoming": [],
    };

    filteredEvents.forEach(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);

        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) groups["Today"].push(e);
        else if (diffDays === 1) groups["Tomorrow"].push(e);
        else if (diffDays > 1 && diffDays <= 7) groups["This Week"].push(e);
        else if (diffDays > 7) groups["Upcoming"].push(e);
        else groups["Recent"].push(e);
    });

    // Reordered categories: Recent (Reported) First
    const categories = ["Recent", "Today", "Tomorrow", "This Week", "Upcoming"];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl border border-muted/30" />
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming earnings scheduled for major stocks right now.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search Filter - Sleek input */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search company or symbol..."
                    className="pl-10 h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all rounded-lg"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {categories.map(category => {
                const categoryEvents = groups[category];
                if (categoryEvents.length === 0) return null;

                return (
                    <div key={category} className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
                            <h2 className="text-lg font-bold tracking-tight text-foreground/90">{category}</h2>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">{categoryEvents.length}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryEvents.map((stock) => {
                                const isReported = category === 'Recent';
                                // CHANGED: Always route to internal analysis page for reported results
                                const linkTarget = `/results/${stock.symbol.includes('.NS') ? stock.symbol.replace('.NS', '') : stock.symbol}`;
                                const isExternal = false; // Internal App Navigation

                                return (
                                    <Card key={stock.symbol} className="overflow-hidden border-muted-foreground/10 hover:border-primary/30 hover:shadow-md transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                                        <Link href={linkTarget}>
                                            <CardContent className="p-0">
                                                <div className="flex flex-col h-full">
                                                    {/* Card Header Part */}
                                                    <div className="p-4 flex items-start justify-between">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                                                {stock.symbol.substring(0, 2)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors pr-2">
                                                                    {stock.companyName}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono mt-0.5">
                                                                    <span className="truncate">{stock.symbol}</span>
                                                                    <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full"></span>
                                                                    <span>{new Date(stock.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Result Out Badge */}
                                                        {isReported ? (
                                                            <Badge variant="outline" className="flex-shrink-0 text-[10px] bg-green-500/10 text-green-600 border-green-200/50 shadow-sm gap-1">
                                                                Analysis <ArrowUpRight className="w-3 h-3" />
                                                            </Badge>
                                                        ) : (
                                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Actions / Footer */}
                                                    <div className="mt-auto border-t border-border/50 p-2 px-4 bg-muted/20 flex items-center justify-between">
                                                        <div className="text-[10px] text-muted-foreground font-medium">
                                                            {category === 'Recent' ? 'Q3 FY25 Reported' : 'Upcoming Q3'}
                                                        </div>
                                                        <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                                            <WatchButton symbol={stock.symbol} className="h-7 text-xs" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
