"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Bell, Bookmark, Megaphone, Gavel, User, Target, Sparkles, Briefcase, LogOut, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { ModeToggle } from "@/components/mode-toggle";

export const SIDEBAR_GROUPS = [
    {
        title: "MAIN",
        items: [
            { label: "Home", href: "/", icon: Home },
            { label: "StocksX Screener", href: "/explore", icon: TrendingUp },
        ]
    },
    {
        title: "RESEARCH",
        items: [
            { label: "Stock of the Week", href: "/stock-of-the-week", icon: Target },
            { label: "Strategist", href: "/strategist", icon: Sparkles },
            { label: "Result Corner", href: "/results", icon: Megaphone },
            { label: "Verdict", href: "/verdict", icon: Gavel },
        ]
    },
    {
        title: "PERSONAL",
        items: [
            { label: "Portfolio", href: "/portfolio", icon: Briefcase },
            { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, authRequired: true },
            { label: "Notifications", href: "/notifications", icon: Bell, authRequired: true },
        ]
    }
];

export function AppSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className={cn("hidden lg:flex flex-col sticky top-20 self-start py-2 h-[calc(100vh-6rem)] gap-2", className)}>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 pb-2 scrollbar-hide">
                {SIDEBAR_GROUPS.map((group, idx) => {
                    const groupItems = group.items.filter(item => !item.authRequired || user);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={idx} className="space-y-2">
                            <h4 className="text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase px-4 mb-2">
                                {group.title}
                            </h4>
                            <div className="space-y-1">
                                {groupItems.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link key={item.href} href={item.href} className="block group">
                                            <div className="relative">
                                                {/* Active Indicator Bar */}
                                                <div
                                                    className={cn(
                                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300",
                                                        active ? "bg-primary" : "bg-transparent group-hover:bg-primary/30"
                                                    )}
                                                />

                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-start gap-4 px-4 py-6 rounded-xl transition-all duration-300 relative overflow-hidden",
                                                        active
                                                            ? "bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-medium"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    {/* Optional glowing background for active state */}
                                                    {active && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                                                    )}

                                                    <item.icon
                                                        size={18}
                                                        className={cn(
                                                            "shrink-0 transition-transform duration-300",
                                                            active ? "text-primary stroke-[2.5]" : "group-hover:scale-110",
                                                            !active && "text-muted-foreground/70"
                                                        )}
                                                    />
                                                    <span className={cn(
                                                        "truncate transition-all duration-300",
                                                        active ? "font-semibold tracking-tight" : "text-[14px]"
                                                    )}>
                                                        {item.label}
                                                    </span>
                                                </Button>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* About Link (Footer area of nav) */}
                <div className="pt-2">
                    <Link href="/about" className="block group">
                        <div className="relative">
                            <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300", isActive("/about") ? "bg-primary" : "bg-transparent")} />
                            <Button variant="ghost" className={cn("w-full justify-start gap-4 px-4 py-6 rounded-xl transition-all duration-300", isActive("/about") ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                                <User size={18} className={cn("shrink-0 transition-transform duration-300", isActive("/about") ? "text-primary stroke-[2.5]" : "text-muted-foreground/70 group-hover:scale-110")} />
                                <span className={cn("truncate transition-all duration-300", isActive("/about") ? "font-semibold tracking-tight" : "text-[14px]")}>About</span>
                            </Button>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Solid Bottom Footer (Separated by border) */}
            <div className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur pt-3 pb-4 px-4 -mx-4">
                <div className="flex flex-col gap-3">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 transition-colors">
                            {user ? (
                                <span className="text-sm font-bold text-primary">{(user.firstName || user.handle || "U")[0]}</span>
                            ) : (
                                <User className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {user ? (user.firstName || user.handle) : "Guest"}
                            </p>
                            <p className="text-[12px] text-muted-foreground truncate opacity-70">
                                {user ? "Pro Member" : "Sign in to interact"}
                            </p>
                        </div>
                        {user && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.preventDefault(); logout(); }}
                                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Subtle Utilities Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground">STABLE</span>
                                <span className="text-[10px] text-muted-foreground/60 font-mono">v2.1.0</span>
                            </div>
                        </div>
                        <div className="opacity-70 hover:opacity-100 transition-all scale-90 hover:scale-100 -mr-2">
                            <ModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
