"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Newspaper, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "News", href: "/news", icon: Newspaper }, // Changed from Notifications
        { label: "Trending", href: "/trending", icon: TrendingUp }, // Changed from Saved
        { label: "Search", href: "/explore", icon: Search },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
            <div className="flex justify-around items-center h-14">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full p-2 transition-colors",
                            isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        {/* Fill icon if active, stroke otherwise (if icon supports it, lucide usually outline) */}
                        <item.icon
                            size={26}
                            strokeWidth={isActive(item.href) ? 2.5 : 2}
                            className={cn("transition-transform duration-200", isActive(item.href) && "scale-105")}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}
