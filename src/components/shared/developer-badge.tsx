'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { CodeXml, Crown } from "lucide-react";

interface DeveloperBadgeProps {
    user: {
        email?: string;
        handle?: string;
        [key: string]: any;
    };
    iconSize?: number;
    className?: string;
}

export function DeveloperBadge({ user, iconSize = 14, className = "" }: DeveloperBadgeProps) {
    if (!user) return null;

    // Check for specific email OR specific handle
    const emailMatch = user.email === 'nethikushwanth@gmail.com';
    const handleMatch = user.handle === 'kushwanthnethi';

    // Strict check
    const isDeveloper = emailMatch || handleMatch;

    if (!isDeveloper) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={`inline-flex items-center justify-center ml-1.5 cursor-help select-none ${className}`}
                        aria-label="Lead Developer"
                    >
                        {/* Premium Indigo/Blue Glow Effect */}
                        <span className="relative flex h-4 w-4 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                            <CodeXml
                                size={iconSize}
                                className="text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                strokeWidth={2.5}
                            />
                        </span>
                    </span>
                </TooltipTrigger>
                <TooltipContent className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white border-0 font-medium shadow-xl">
                    <div className="flex items-center gap-1.5">
                        <Crown size={14} className="text-yellow-300 fill-current" />
                        <p>Lead Developer & Creator</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
