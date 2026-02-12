"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function VerifiedBadge({ className }: { className?: string }) {
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
                        <BadgeCheck
                            className="w-[14px] h-[14px] md:w-[15px] md:h-[15px] text-[#1D9BF0]"
                            fill="currentColor"
                            stroke="white"
                            strokeWidth={2.5}
                        />
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Developer</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
