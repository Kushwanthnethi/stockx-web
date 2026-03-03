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
        <Card className="mb-6 relative overflow-hidden bg-card text-card-foreground border shadow-sm">
            <div className="p-5 flex flex-col md:flex-row gap-6 items-start justify-between min-h-[140px]">
                <div className="space-y-3 z-10 flex-1 py-1">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">
                        {activeHoliday.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed md:max-w-md">
                        {activeHoliday.message}
                    </p>
                </div>

                {/* Decorative Element mimicking the image */}
                <div className="hidden sm:flex items-center justify-center w-40 h-full absolute right-12 top-0 z-0">
                    {activeHoliday.imageType === 'holi' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Simplified Splash effect */}
                            <div className="absolute top-1/4 right-0 w-2 h-2 rounded-full bg-blue-400" />
                            <div className="absolute top-1/3 right-4 w-3 h-3 rounded-full bg-green-400" />
                            <div className="absolute top-1/2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            <div className="absolute bottom-1/3 right-6 w-2.5 h-2.5 rounded-full bg-pink-400" />

                            {/* Sparkles conveying celebration */}
                            <div className="relative text-emerald-500 rounded-full bg-emerald-50 dark:bg-emerald-500/10 p-4 transform rotate-12">
                                <Sparkles className="w-8 h-8 opacity-80" />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground h-8 w-8 z-20 rounded-full"
                onClick={handleDismiss}
                aria-label="Dismiss message"
            >
                <X className="h-4 w-4" />
            </Button>
        </Card>
    );
}
