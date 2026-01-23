"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Bell, Bookmark, Megaphone, Gavel, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="hidden lg:block lg:col-span-2 space-y-2 sticky top-20 self-start h-fit">
            <Link href="/">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <Home size={18} />
                    Home
                </Button>
            </Link>
            <Link href="/explore">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/explore") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <TrendingUp size={18} />
                    StockX Screener
                </Button>
            </Link>
            <Link href="/results">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/results") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <Megaphone size={18} />
                    Result Corner
                </Button>
            </Link>
            <Link href="/verdict">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/verdict") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <Gavel size={18} className="shrink-0" />
                    <span className="truncate">Verdict</span>
                    <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm shrink-0">NEW</span>
                </Button>
            </Link>
            <Link href="/notifications">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/notifications") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <Bell size={18} />
                    Notifications
                </Button>
            </Link>
            <Link href="/bookmarks">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/bookmarks") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <Bookmark size={18} />
                    Bookmarks
                </Button>
            </Link>
            <Link href="/about">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isActive("/about") ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <User size={18} />
                    About
                </Button>
            </Link>
        </aside>
    );
}
