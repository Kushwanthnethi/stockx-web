"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Bell, Bookmark, Megaphone, Gavel, User, Target } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const SIDEBAR_ITEMS = [
    { label: "Home", href: "/", icon: Home },
    { label: "StockX Screener", href: "/explore", icon: TrendingUp },
    { label: "Stock of the Week", href: "/stock-of-the-week", icon: Target, isNew: true },
    { label: "Result Corner", href: "/results", icon: Megaphone },

    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "About", href: "/about", icon: User },
];

import { useAuth } from "@/providers/auth-provider";

export function AppSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (path: string) => pathname === path;

    const filteredItems = SIDEBAR_ITEMS.filter(item => {
        if (!user && (item.label === "Notifications" || item.label === "Bookmarks")) {
            return false;
        }
        return true;
    });

    return (
        <aside className={cn("hidden lg:block space-y-2 sticky top-20 self-start h-fit py-2", className)}>
            {filteredItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3",
                            isActive(item.href) ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon size={18} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.isNew && (
                            <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm shrink-0">NEW</span>
                        )}
                    </Button>
                </Link>
            ))}
        </aside>
    );
}
