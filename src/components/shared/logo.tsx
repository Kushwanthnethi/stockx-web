import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconClassName?: string;
}

export function Logo({ className, iconClassName }: LogoProps) {
    return (
        <Link href="/" className={cn("flex items-center gap-1.5 md:gap-1.5 select-none", className)}>
            <TrendingUp className={cn("text-emerald-500 h-[26px] w-[26px] md:h-6 md:w-6 transition-transform hover:-translate-y-0.5 hover:translate-x-0.5", iconClassName)} />

            <span className="text-xl md:text-2xl font-plus-jakarta-sans font-extrabold tracking-[-0.03em] flex items-center">
                {/* 'Stocks' part - High contrast block, adapts to light/dark mode */}
                <span className="text-slate-900 dark:text-white">
                    Stocks
                </span>

                {/* 'X' part - Extra heavy, leaning forward momentum, with a tech gradient */}
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 ml-[1px] transform -skew-x-6">
                    X
                </span>
            </span>
        </Link>
    );
}
