"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Newspaper, TrendingUp, BarChart2, PlusCircle } from "lucide-react"; // Added BarChart2 for Markets
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // Add motion for smooth interactions

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Markets", href: "/trending", icon: BarChart2 }, // Consolidated Watchlist/Trending
        { label: "Create", href: "/create", icon: PlusCircle, special: true }, // Hypothetical Create Action
        { label: "News", href: "/news", icon: Newspaper },
        { label: "Search", href: "/explore", icon: Search },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
            <nav className="glass-dock pointer-events-auto flex items-center justify-around px-2 h-16 rounded-2xl w-full max-w-sm">
                {navItems.map((item) => {
                    const active = isActive(item.href);

                    if (item.special) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform active:scale-95 transition-transform border-4 border-background">
                                    <item.icon size={28} />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-full relative group",
                                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {/* Active Indicator */}
                            {active && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -top-3 h-1 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <item.icon
                                size={24}
                                strokeWidth={active ? 2.5 : 2}
                                className={cn("transition-all duration-300", active && "scale-110 drop-shadow-md")}
                            />
                            {/* <span className={cn("text-[10px] font-medium mt-1 transition-all", active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                                {item.label}
                            </span> */}
                        </Link>
                    );
                })}
            </nav>
        </div >
    );
}
