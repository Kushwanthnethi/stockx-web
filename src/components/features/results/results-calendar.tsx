
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WatchButton } from "@/components/features/stocks/watch-button";
import { Calendar, ChevronRight, TrendingUp, Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/config";

interface EarningEvent {
    symbol: string;
    companyName: string;
    formattedDate: string;
    date: string; // ISO string from backend
    revenue?: number;
    profit?: number;
    eps?: number;
    revenueGrowth?: number;
    pdfUrl?: string;
    isNifty50?: boolean;
    isMidcap100?: boolean;
    resultStatus?: 'UPCOMING' | 'DECLARED';
}

export function ResultsCalendar() {
    const [events, setEvents] = useState<EarningEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'declared'>('upcoming');
    const [indexFilter, setIndexFilter] = useState<'ALL' | 'NIFTY50' | 'MIDCAP'>('ALL');

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/earnings-calendar`);
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

    // Filter Logic
    const filteredEvents = events.filter(e => {
        // Search
        const matchesSearch = e.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        // Tab (Status)
        // If status is not explicitly set by backend yet (during transition), derive it from date
        const status = e.resultStatus || (new Date(e.date) < new Date() ? 'DECLARED' : 'UPCOMING');
        const matchesTab = status.toLowerCase() === activeTab;

        // Index Filter
        let matchesIndex = true;
        if (indexFilter === 'NIFTY50') matchesIndex = !!e.isNifty50;
        if (indexFilter === 'MIDCAP') matchesIndex = !!e.isMidcap100;

        return matchesSearch && matchesTab && matchesIndex;
    });

    // Grouping for UPCOMING: Today, Tomorrow, Later
    // Grouping for DECLARED: Yesterday, Earlier
    const groupedEvents: Record<string, EarningEvent[]> = {};

    if (activeTab === 'upcoming') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredEvents.forEach(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            let key = "Upcoming";
            if (diffDays <= 0) key = "Today"; // Handle slight time diffs
            else if (diffDays === 1) key = "Tomorrow";
            else if (diffDays <= 7) key = "This Week";

            if (!groupedEvents[key]) groupedEvents[key] = [];
            groupedEvents[key].push(e);
        });
    } else {
        // For declared, just show flat list or group by date? 
        // Let's group by "Latest" for now
        groupedEvents["Latest Results"] = filteredEvents;
    }

    const categories = activeTab === 'upcoming'
        ? ["Today", "Tomorrow", "This Week", "Upcoming"]
        : ["Latest Results"];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl border border-muted/30" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Tabs */}
                <div className="flex p-1 bg-muted/30 rounded-lg border">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('declared')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'declared' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Declared
                    </button>
                </div>

                {/* Index Filters */}
                <div className="flex gap-2">
                    <Badge
                        variant={indexFilter === 'ALL' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setIndexFilter('ALL')}
                    >
                        All
                    </Badge>
                    <Badge
                        variant={indexFilter === 'NIFTY50' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setIndexFilter('NIFTY50')}
                    >
                        Nifty 50
                    </Badge>
                    <Badge
                        variant={indexFilter === 'MIDCAP' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setIndexFilter('MIDCAP')}
                    >
                        Midcap 100
                    </Badge>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 h-9 bg-background/50 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No results found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {categories.map(category => {
                        const categoryEvents = groupedEvents[category] || [];
                        if (categoryEvents.length === 0) return null;

                        return (
                            <div key={category} className="space-y-3 animate-in fade-in-50">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    {categoryEvents.map(stock => (
                                        <Card key={stock.symbol} className="overflow-hidden border-muted-foreground/10 hover:border-primary/30 transition-all hover:shadow-md bg-card/40 backdrop-blur-sm">
                                            <Link href={`/results/${stock.symbol.replace('.NS', '').replace('.BO', '')}`}>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                            {stock.symbol.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm">{stock.companyName}</div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span className="font-mono">{stock.symbol}</span>
                                                                {stock.isNifty50 && <Badge variant="secondary" className="px-1 h-4 text-[9px]">NIFTY 50</Badge>}
                                                                {stock.isMidcap100 && <Badge variant="secondary" className="px-1 h-4 text-[9px]">MIDCAP</Badge>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs font-medium bg-muted/50 px-2 py-1 rounded inline-block">
                                                            {new Date(stock.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                        {activeTab === 'declared' && (
                                                            <div className="text-[10px] text-green-500 mt-1 flex items-center justify-end gap-1 font-medium">
                                                                Analysis <ArrowUpRight className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
