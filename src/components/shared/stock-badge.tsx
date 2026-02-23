import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLivePrice } from "@/hooks/use-live-price";

interface StockBadgeProps {
    symbol: string;
    name?: string; // Optional full name
    change?: number; // % Change (e.g., 1.5 or -2.3)
    price?: number;
    className?: string;
    live?: boolean;
}

export function StockBadge({ symbol, change: initialChange, price: initialPrice, className, live }: StockBadgeProps) {
    const liveData = useLivePrice({
        symbol,
        initialPrice: initialPrice || 0,
        initialChangePercent: initialChange || 0
    });

    const displayPrice = live ? liveData.price : initialPrice;
    const displayChange = live ? liveData.changePercent : initialChange;
    const flash = live ? liveData.flash : null;

    const isPositive = displayChange !== undefined && displayChange >= 0;
    const isNegative = displayChange !== undefined && displayChange < 0;

    return (
        <Link
            href={`/stock/${symbol}`}
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300",
                // Default style
                "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                // Positive override
                isPositive && "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
                // Negative override
                isNegative && "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
                // Flash animations
                flash === "up" && "ring-2 ring-green-500 scale-105",
                flash === "down" && "ring-2 ring-red-500 scale-105",
                className
            )}
        >
            <span className="font-bold">{symbol}</span>
            {displayPrice !== undefined && displayPrice > 0 && (
                <span className="font-mono text-[10px] opacity-70">
                    ₹{displayPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
            )}
            {displayChange !== undefined && (
                <span className="text-[10px] font-black flex items-center gap-0.5">
                    {displayChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(displayChange).toFixed(2)}%
                </span>
            )}
        </Link>
    );
}
