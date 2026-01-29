"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function VerdictCriteria() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary gap-2 h-auto py-1 px-2"
            >
                <Info size={12} />
                View Intelligence Criteria
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 border rounded-xl bg-card/40 backdrop-blur-sm p-4 text-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-sm tracking-tight">Institutional Intelligence Logic</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                    <X size={14} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Analyst Ratings */}
                                <div className="space-y-2">
                                    <div className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] border-b pb-1">Analyst Consensus (1-5 Scale)</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-1.5 rounded text-emerald-500">
                                            <span className="font-bold">1.0 - 2.5</span>
                                            <span className="font-black uppercase text-[10px]">Strong Buy / Buy</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-amber-500/10 p-1.5 rounded text-amber-500">
                                            <span className="font-bold">2.6 - 3.5</span>
                                            <span className="font-black uppercase text-[10px]">Hold / Neutral</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-rose-500/10 p-1.5 rounded text-rose-500">
                                            <span className="font-bold">3.6 - 5.0</span>
                                            <span className="font-black uppercase text-[10px]">Sell / Underperform</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground/60 italic mt-1">*Lower score is better (1.0 = Strong Buy)</p>
                                    </div>
                                </div>

                                {/* Earnings */}
                                <div className="space-y-2">
                                    <div className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] border-b pb-1">Earnings Performance</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-1.5 rounded text-emerald-500">
                                            <span className="font-bold">BEAT</span>
                                            <span className="font-black uppercase text-[10px]">Exceeded Estimates</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-amber-500/10 p-1.5 rounded text-amber-500">
                                            <span className="font-bold">MEET</span>
                                            <span className="font-black uppercase text-[10px]">Met Expectations</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-rose-500/10 p-1.5 rounded text-rose-500">
                                            <span className="font-bold">MISS</span>
                                            <span className="font-black uppercase text-[10px]">Missed Estimates</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Momentum */}
                                <div className="space-y-2">
                                    <div className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] border-b pb-1">Technical Momentum</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-1.5 rounded text-emerald-500">
                                            <span className="font-bold">BULLISH</span>
                                            <span className="font-black uppercase text-[10px]">Upward Trend</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-amber-500/10 p-1.5 rounded text-amber-500">
                                            <span className="font-bold">NEUTRAL</span>
                                            <span className="font-black uppercase text-[10px]">Sideways / Range</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-rose-500/10 p-1.5 rounded text-rose-500">
                                            <span className="font-bold">BEARISH</span>
                                            <span className="font-black uppercase text-[10px]">Downward Trend</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
