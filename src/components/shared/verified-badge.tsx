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
                    <motion.div
                        className={cn("inline-flex items-center justify-center align-middle cursor-help relative overflow-hidden rounded-full", className)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{ width: '1.25rem', height: '1.25rem' }} // Default size 20px (w-5)
                    >
                        {/* Animated Gradient Background */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-blue-400 to-blue-600"
                            animate={{
                                backgroundPosition: ["0% 0%", "100% 100%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "linear"
                            }}
                            style={{ backgroundSize: "200% 200%" }}
                        />

                        {/* Centered White Tick */}
                        <svg
                            className="w-3 h-3 text-white relative z-10 drop-shadow-sm"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <motion.path
                                d="M20 6L9 17l-5-5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            />
                        </svg>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Developer</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
