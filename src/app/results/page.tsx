
"use client";

import React from 'react';
import { ResultsCalendar } from '@/components/features/results/results-calendar';
import { Megaphone, CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from "@/components/layout/app-sidebar";


export default function ResultsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">

            <main className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <div className="lg:col-span-10 space-y-8">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8">
                        <div className="relative z-10">
                            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                                Live Updates
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                <Megaphone className="w-8 h-8 text-primary" />
                                Result Corner
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-lg">
                                Track financial result announcements from top NSE & BSE companies. Stay ahead of market movements with real-time updates.
                            </p>
                        </div>

                        {/* Decorative Icon */}
                        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-10 translate-y-10">
                            <CalendarCheck className="w-64 h-64" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Calendar Feed */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b">
                                <h2 className="text-xl font-semibold tracking-tight">Earnings Calendar</h2>
                                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                    Source: NSE/BSE
                                </span>
                            </div>
                            <ResultsCalendar />
                        </div>

                        {/* Right Sidebar / Legend */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-5 rounded-xl border bg-card/50 backdrop-blur-sm sticky top-24">
                                { /* Market Status removed as per user request */}

                                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Legend</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                        <span>Missed Estimates</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        <span>Beat Estimates</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <span>Neutral / In-line</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
