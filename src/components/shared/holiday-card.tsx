"use client";

import React, { useEffect, useState } from "react";
import { getActiveHoliday, type Holiday } from "@/lib/holidays";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HolidayCard() {
    const [activeHoliday, setActiveHoliday] = useState<Holiday | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const holiday = getActiveHoliday();
        if (holiday) {
            const dismissed = localStorage.getItem(`dismissed_holiday_${holiday.id}`);
            if (!dismissed) {
                setActiveHoliday(holiday);
                setIsVisible(true);
            }
        }
    }, []);

    if (!isClient || !isVisible || !activeHoliday) return null;

    const handleDismiss = () => {
        localStorage.setItem(`dismissed_holiday_${activeHoliday.id}`, "true");
        setIsVisible(false);
    };

    return (
        <Card className="mb-6 relative overflow-hidden border-0 shadow-lg group">
            {/* Base gradient background - responds to light/dark mode */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-white/90 to-fuchsia-50/90 dark:from-indigo-950/40 dark:via-background dark:to-fuchsia-950/40 z-0 transition-colors duration-500" />

            {/* Animated Background Orbs for 'holi' theme */}
            {activeHoliday.imageType === 'holi' && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-700">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-bl from-pink-400/40 to-fuchsia-500/0 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute -bottom-[40%] right-[10%] w-[40%] h-[120%] bg-gradient-to-tl from-violet-500/40 to-indigo-500/0 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
                    <div className="absolute top-[10%] right-[30%] w-[30%] h-[80%] bg-gradient-to-b from-amber-400/30 to-orange-500/0 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                </div>
            )}

            {/* Glassmorphism content wrapper */}
            <div className="relative z-10 p-6 flex flex-col md:flex-row gap-6 items-center justify-between min-h-[140px] backdrop-blur-[2px] bg-white/10 dark:bg-black/10">
                <div className="space-y-3 flex-1 w-full relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-200/50 dark:border-indigo-800/50 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Market Holiday
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {activeHoliday.title}
                    </h2>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                        {activeHoliday.message}
                    </p>
                </div>

                {/* Decorative Icon Graphic */}
                <div className="hidden sm:flex items-center justify-center w-32 h-full flex-shrink-0 relative z-10 mr-8">
                    {activeHoliday.imageType === 'holi' && (
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* Colorful rings */}
                            <div className="absolute inset-0 rounded-full border-4 border-pink-400/30 animate-[spin_8s_linear_infinite]" />
                            <div className="absolute inset-2 rounded-full border-4 border-t-violet-400/60 border-r-transparent border-b-amber-400/60 border-l-transparent animate-[spin_12s_linear_infinite_reverse]" />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dismiss Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 h-8 w-8 z-20 rounded-full transition-colors"
                onClick={handleDismiss}
                aria-label="Dismiss message"
            >
                <X className="h-4 w-4" />
            </Button>

            {/* Bottom highlight border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 opacity-80" />
        </Card>
    );
}
