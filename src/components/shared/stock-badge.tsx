import Link from "next/link";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
    symbol: string;
    name?: string; // Optional full name
    change?: number; // % Change (e.g., 1.5 or -2.3)
    className?: string;
}

export function StockBadge({ symbol, change, className }: StockBadgeProps) {
    const isPositive = change && change >= 0;
    const isNegative = change && change < 0;

    return (
        <Link
            href={`/stock/${symbol}`}
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                // Default style
                "bg-slate-100 text-slate-700 hover:bg-slate-200",
                // Positive override
                isPositive && "bg-green-100 text-green-700 hover:bg-green-200",
                // Negative override
                isNegative && "bg-red-100 text-red-700 hover:bg-red-200",
                className
            )}
        >
            <span>${symbol}</span>
            {change !== undefined && (
                <span className="text-[10px]">
                    {isPositive ? "+" : ""}
                    {change}%
                </span>
            )}
        </Link>
    );
}
