"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function VerifiedBadge({ className }: { className?: string }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={cn("inline-flex items-center justify-center align-middle cursor-help relative", className)} style={{ width: '1.25rem', height: '1.25rem' }}>
                        {/* Animated Badge Background (Scalloped Shape) */}
                        <motion.svg
                            viewBox="0 0 24 24"
                            className="absolute inset-0 text-blue-500 w-full h-full drop-shadow-sm"
                            initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <path
                                fill="currentColor"
                                d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.748 2.795 1.867 3.61-.593 1.374-.153 2.973 1.054 3.738C5.232 20.35 6.136 20.5 7 20.5c.983 0 1.93-.19 2.802-.516.48.064.974.14 1.488.166.38.643.904 1.15 1.517 1.44.825.388 1.745.388 2.57 0 .613-.29 1.14-.796 1.517-1.44 2.198-.113 4.093-1.638 4.608-3.805 1.12-.815 1.868-2.153 1.868-3.61z"
                            />
                        </motion.svg>

                        {/* Centered White Tick */}
                        <svg
                            className="w-2.5 h-2.5 text-white relative z-10 pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <motion.path
                                d="M20 6L9 17l-5-5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            />
                        </svg>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Developer</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
