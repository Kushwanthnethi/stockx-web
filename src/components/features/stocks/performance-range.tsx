import React from 'react';
import { cn } from "@/lib/utils";

interface PerformanceRangeProps {
    label: string;
    low: number;
    high: number;
    current?: number;
    className?: string;
}

export function PerformanceRange({ label, low, high, current, className }: PerformanceRangeProps) {
    let percentage = 0;
    if (current && high > low) {
        percentage = ((current - low) / (high - low)) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Clamp 0-100
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-foreground/80">{label}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-left w-24">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1 font-medium">Low</div>
                    <div className="font-semibold font-mono text-sm sm:text-base">
                        {low !== undefined && low !== null ? `₹${low.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                    </div>
                </div>

                <div className="relative flex-1 h-1.5 bg-muted-foreground/20 rounded-full">
                    {/* The filled track up to current price */}
                    <div
                        className="absolute top-0 left-0 h-full bg-foreground/60 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />

                    {/* The thumb indicator */}
                    {current !== undefined && high !== undefined && low !== undefined && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center shadow-sm"
                            style={{ left: `${percentage}%` }}
                        >
                            <div className="w-4 h-4 rounded-full bg-white border-[3px] border-black dark:border-background shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        </div>
                    )}
                </div>

                <div className="text-right w-24">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1 font-medium">High</div>
                    <div className="font-semibold font-mono text-sm sm:text-base">
                        {high !== undefined && high !== null ? `₹${high.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
}
