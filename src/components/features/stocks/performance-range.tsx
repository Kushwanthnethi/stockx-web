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
    // Calculate percentage position
    // If current is missing, we just show the range text without the indicator (or user might want just the range)
    // Default to 50% if math fails

    let percentage = 0;
    if (current && high > low) {
        percentage = ((current - low) / (high - low)) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Clamp 0-100
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-left w-24">
                    <div className="text-sm text-muted-foreground mb-1">Low</div>
                    <div className="font-semibold font-mono">
                        {low !== undefined && low !== null ? `₹${low.toFixed(2)}` : 'N/A'}
                    </div>
                </div>

                <div className="relative flex-1 h-1.5 bg-secondary rounded-full">
                    {/* Filled track option (optional, let's keep it simple background first) */}

                    {/* Triangle Indicator */}
                    {current !== undefined && high !== undefined && low !== undefined && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                            style={{ left: `${percentage}%` }}
                        >
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-foreground" />
                        </div>
                    )}
                </div>

                <div className="text-right w-24">
                    <div className="text-sm text-muted-foreground mb-1">High</div>
                    <div className="font-semibold font-mono">
                        {high !== undefined && high !== null ? `₹${high.toFixed(2)}` : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
}
