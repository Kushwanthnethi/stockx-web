"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActivityGraphProps {
    data?: { date: string; count: number }[];
}

export function ActivityGraph({ data = [] }: ActivityGraphProps) {
    // Start from Jan 1, 2026
    const startDate = new Date('2026-01-01');
    const today = new Date();

    const normalizedData = React.useMemo(() => {
        const map = new Map<string, number>();
        if (data && data.length > 0) {
            data.forEach(d => map.set(d.date, d.count));
        }
        return map;
    }, [data]);

    const weeks = React.useMemo(() => {
        const weeksArray = [];
        // Align to Sunday before Jan 1
        const startDay = startDate.getDay();
        const gridStartDate = new Date(startDate);
        gridStartDate.setDate(startDate.getDate() - startDay);

        for (let w = 0; w < 52; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(gridStartDate);
                date.setDate(gridStartDate.getDate() + (w * 7) + d);

                if (date > today) {
                    week.push(null);
                } else if (date < startDate) {
                    week.push(null);
                } else {
                    week.push(date);
                }
            }
            weeksArray.push(week);
        }
        return weeksArray;
    }, [startDate, today]);

    const getColor = (count: number) => {
        if (count === 0) return "bg-muted/30";
        if (count <= 1) return "bg-emerald-900/40 dark:bg-emerald-900/60";
        if (count <= 3) return "bg-emerald-600/60";
        if (count <= 5) return "bg-emerald-500/80";
        return "bg-emerald-400";
    };

    return (
        <div className="w-full border rounded-xl p-6 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card/80">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                    {Array.from(normalizedData.values()).reduce((a, b) => a + b, 0)} site visits in 2026
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Low</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-muted/30" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-900/40 dark:bg-emerald-900/60" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-500/80" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
                    </div>
                    <span>High</span>
                </div>
            </div>

            <div className="flex gap-[3px] overflow-x-auto pb-2 scrollbar-hide">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-[3px]">
                        {week.map((date, dIndex) => {
                            if (!date) return <div key={dIndex} className="w-3 h-3 rounded-[2px] bg-muted/10 opacity-20" />;

                            const dateStr = date.toISOString().split('T')[0];
                            const count = normalizedData.get(dateStr) || 0;

                            return (
                                <TooltipProvider key={dIndex}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <div
                                                className={cn(
                                                    "w-3 h-3 rounded-[2px] transition-all duration-300 hover:ring-2 hover:ring-ring/50",
                                                    getColor(count)
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="text-xs font-medium">
                                                {count === 0 ? "No" : count} visits on {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
