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
        const checkMaintenanceTime = () => {
            const now = new Date();
            // Set a future date here to enable the maintenance popup
            // Disabled by default (past date = never shows)
            const maintenanceEnd = new Date("2026-01-01T00:00:00+05:30");

            if (now < maintenanceEnd) {
                setOpen(true);

                const msUntilEnd = maintenanceEnd.getTime() - now.getTime();
                if (msUntilEnd > 0) {
                    const timer = setTimeout(() => setOpen(false), msUntilEnd);
                    return () => clearTimeout(timer);
                }
            } else {
                setOpen(false);
            }
        };

        checkMaintenanceTime();
    }, []);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => {
            // Allow dismissal but it will stay visible on every page load unless dismissed using the button
        }}>
            <DialogContent className="w-[95%] max-w-[520px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl [&>button]:hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-purple-500/5 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="space-y-4 text-center pb-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="mx-auto bg-gradient-to-br from-indigo-500/20 to-blue-500/10 p-5 rounded-full w-fit shadow-inner ring-1 ring-indigo-500/30"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Construction className="h-10 w-10 text-indigo-500" />
                            </motion.div>
                        </motion.div>

                        <div className="space-y-3">
                            <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
                                Scheduled Maintenance
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
                                We're performing scheduled maintenance to improve our infrastructure and services.
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
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Clock className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-foreground">Downtime Window</p>
                                <p className="text-muted-foreground">We'll be back online shortly</p>
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
                                <p className="text-muted-foreground">Infrastructure upgrades for faster and more reliable market data</p>
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
                            Live data, trading functionality, and some features may be temporarily unavailable. Thank you for your patience! 🙏
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
