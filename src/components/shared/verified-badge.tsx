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
                    <motion.span
                        className={cn("text-blue-500 inline-flex items-center justify-center align-middle cursor-help", className)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.748 2.795 1.867 3.61-.593 1.374-.153 2.973 1.054 3.738C5.232 20.35 6.136 20.5 7 20.5c.983 0 1.93-.19 2.802-.516.48.064.974.14 1.488.166.38.643.904 1.15 1.517 1.44.825.388 1.745.388 2.57 0 .613-.29 1.14-.796 1.517-1.44 2.198-.113 4.093-1.638 4.608-3.805 1.12-.815 1.868-2.153 1.868-3.61zM12 16.5l-3.5-3.5 1.414-1.414 2.086 2.086 5.586-5.586 1.414 1.414L12 16.5z" />
                        </svg>
                    </motion.span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Verified User</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
