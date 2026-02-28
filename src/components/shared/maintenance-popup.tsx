"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Construction, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function MaintenancePopup() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if today is Feb 28, 2026 in IST (UTC+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);

        const isMaintenanceDay =
            istTime.getFullYear() === 2026 &&
            istTime.getMonth() === 1 && // February (0-indexed)
            istTime.getDate() === 28;

        if (isMaintenanceDay) {
            setOpen(true);
        }

        // Auto-dismiss at midnight IST (start of March 1)
        if (isMaintenanceDay) {
            const midnightIST = new Date(Date.UTC(2026, 2, 1, 0, 0, 0, 0)); // March 1, 2026 00:00 UTC
            // Midnight IST = 18:30 UTC on Feb 28
            midnightIST.setTime(Date.UTC(2026, 1, 28, 18, 30, 0, 0));
            const msUntilMidnight = midnightIST.getTime() - now.getTime();
            if (msUntilMidnight > 0) {
                const timer = setTimeout(() => setOpen(false), msUntilMidnight);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => {
            // Allow dismissal but it will stay visible on every page
        }}>
            <DialogContent className="w-[95%] max-w-[520px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl [&>button]:hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-red-500/5 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="space-y-4 text-center pb-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-5 rounded-full w-fit shadow-inner ring-1 ring-amber-500/30"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Construction className="h-10 w-10 text-amber-500" />
                            </motion.div>
                        </motion.div>

                        <div className="space-y-3">
                            <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
                                Scheduled Maintenance
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
                                We're performing scheduled server maintenance to upgrade our infrastructure.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Info Cards */}
                    <div className="space-y-3 mt-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
                        >
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-foreground">Downtime Window</p>
                                <p className="text-muted-foreground">Feb 28, 2026 — Back online by March 1</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
                        >
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <ArrowRight className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-foreground">What's happening?</p>
                                <p className="text-muted-foreground">Server migration for faster, more reliable service</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-center"
                    >
                        <p className="text-xs text-muted-foreground/70">
                            Some features may be temporarily unavailable. Thank you for your patience! 🙏
                        </p>
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors cursor-pointer"
                        >
                            I understand, continue browsing
                        </button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
