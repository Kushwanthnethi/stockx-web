"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Megaphone, Gavel, Bell, Bookmark, User, FileText, Target, Sparkles, LogOut, Send as SendIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// New X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
);

const INVESTOR_QUOTES = [
    "Patience is the key to strategic alpha.",
    "The best investment you can make is in yourself.",
    "Be fearful when others are greedy, and greedy when others are fearful.",
    "Focus on the process, not just the outcome.",
    "Successful investing is about managing risk, not avoiding it.",
    "In the world of finance, knowledge is the greatest asset.",
];

// Custom items for Mobile Drawer (Profile Menu) as per user request
// Order: StockX Screener, Markets, News, Result Corner, Notifications, Bookmarks (Saved), About
const MOBILE_DRAWER_ITEMS = [
    { label: "Result Corner", href: "/results", icon: Megaphone },
    { label: "StocksX Screener", href: "/explore", icon: TrendingUp },
    { label: "Markets", href: "/trending", icon: TrendingUp },
    { label: "News", href: "/news", icon: FileText },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "About", href: "/about", icon: User },
];

export function MobileSheet({ trigger, className }: { trigger?: React.ReactNode, className?: string }) {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [quote, setQuote] = React.useState(INVESTOR_QUOTES[0]);
    const { theme, setTheme } = useTheme();

    React.useEffect(() => {
        const randomQuote = INVESTOR_QUOTES[Math.floor(Math.random() * INVESTOR_QUOTES.length)];
        setQuote(randomQuote);
    }, [open]);

    const isActive = (path: string) => pathname === path;

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Close on navigation
    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Prevent body scroll when open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    return (
        <div className={cn("md:hidden", className)}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            )}

            {mounted && open && (
                <>
                    {/* Portal content */}
                    {typeof document !== 'undefined' && createPortal(
                        <>
                            {/* Overlay */}
                            <div
                                className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-sm animate-in fade-in-0"
                                onClick={() => setOpen(false)}
                            />

                            {/* Content Sidebar */}
                            <div
                                className={cn(
                                    "fixed inset-y-0 left-0 z-[120] h-full w-[85%] max-w-sm border-r bg-white dark:bg-black shadow-2xl transition ease-in-out duration-300 transform",
                                    "translate-x-0"
                                )}
                            >
                                <div className="flex items-center justify-between mb-8 px-2 pt-4">
                                    <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-1" onClick={() => setOpen(false)}>
                                        StocksX
                                    </Link>
                                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {MOBILE_DRAWER_ITEMS.filter(item => {
                                        if (!user && (item.href === '/notifications' || item.href === '/bookmarks')) {
                                            return false;
                                        }
                                        return true;
                                    }).map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start gap-3",
                                                    isActive(item.href) ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                <item.icon size={18} className="shrink-0" />
                                                <span>{item.label}</span>
                                                {(item as any).isNew && (
                                                    <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm shrink-0">NEW</span>
                                                )}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>

                                {/* Footer Utility Dock */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-6 border-t bg-slate-50/50 dark:bg-zinc-950/50 backdrop-blur-md">
                                    {/* User Profile Card */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                                            {user ? (
                                                <span className="text-sm font-bold text-primary">{(user.firstName || user.handle || "U")[0]}</span>
                                            ) : (
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">
                                                {user ? (user.firstName || user.handle) : "Guest Investor"}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[10px] text-muted-foreground font-medium italic leading-tight">
                                                    "{quote}"
                                                </p>
                                            </div>
                                        </div>
                                        {user && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => logout()}
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Socials & Meta */}
                                    <div className="px-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <Link href="https://x.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                                    <XIcon className="h-4 w-4" />
                                                </Link>
                                                <Link href="https://t.me" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                                    <SendIcon className="h-4 w-4" />
                                                </Link>
                                                <div className="h-4 w-[1px] bg-border mx-1" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                                >
                                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                                    <span className="sr-only">Toggle theme</span>
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-50">
                                                <ShieldCheck className="h-3 w-3" />
                                                <span className="text-[10px] font-mono tracking-tighter">v2.1.0-STABLE</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[9px] text-muted-foreground/60 font-medium tracking-tight">
                                                © 2026 StocksX Inc. Crafted for Alpha.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>,
                        document.body
                    )}
                </>
            )}
        </div>
    );
}
