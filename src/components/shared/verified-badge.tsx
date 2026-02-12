"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BadgeCheck, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function VerifiedBadge({ className, user }: { className?: string, user?: any }) {
    const isBot = user?.handle?.toLowerCase() === 'stocksxbot' || user?.name === 'StocksX Bot';

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <motion.div
                        className={cn("inline-flex items-center justify-center align-middle cursor-help ml-1", className)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        {isBot ? (
                            <Bot
                                className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-[#1D9BF0]"
                                fill="currentColor"
                                stroke="white"
                                strokeWidth={2}
                            />
                        ) : (
                            <BadgeCheck
                                className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-[#1D9BF0]"
                                fill="currentColor"
                                stroke="white"
                                strokeWidth={2}
                            />
                        )}
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isBot ? "Automated Bot" : "Verified"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
