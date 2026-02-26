"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Bell, Bookmark, Megaphone, Gavel, User, Target, Sparkles, Briefcase, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

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
        <aside className={cn("hidden lg:flex flex-col space-y-6 sticky top-20 self-start py-2 h-[calc(100vh-6rem)]", className)}>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 pb-20 scrollbar-hide">
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

            {/* Sticky Bottom User Profile Card */}
            <div className="absolute bottom-0 left-0 right-0 bg-background pt-4 pb-2 border-t border-border/40">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border/50">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-sm">
                        {user ? (
                            <span className="text-sm font-bold text-primary">{(user.firstName || user.handle || "U")[0]}</span>
                        ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate block leading-tight">
                            {user ? (user.firstName || user.handle) : "Guest"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                            {user ? "Pro Member" : "Sign in to interact"}
                        </p>
                    </div>
                    {user && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.preventDefault(); logout(); }}
                            className="shrink-0 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </aside>
    );
}
