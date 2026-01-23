"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { isMarketOpen } from "@/lib/market-time";

interface LivePriceProps {
    price: number;
    change: number;
    changePercent: number;
    flash?: "up" | "down" | null;
}

export function LivePrice({ price, change, changePercent, flash }: LivePriceProps) {
    const isPositive = change >= 0;

    return (
        <div className="flex flex-col items-end">
            {/* Price with flash effect */}
            <div className={`font-mono text-right transition-colors duration-300 ${flash === "up" ? "text-green-500 bg-green-50" :
                flash === "down" ? "text-red-500 bg-red-50" : ""
                }`}>
                ₹{price.toFixed(2)}
            </div>

            {/* Change Indicator */}
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
            </div>
        </div>
    );
}
