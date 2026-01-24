"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_ITEMS } from "./app-sidebar";

export function MobileSheet() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

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
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Content Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-[100] h-full w-[85%] max-w-sm border-r bg-background/95 backdrop-blur-xl shadow-2xl transition ease-in-out duration-300 transform",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between mb-8 px-2 pt-4">
                    <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-1">
                        StockX
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {SIDEBAR_ITEMS.map((item) => (
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
                                {item.isNew && (
                                    <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm shrink-0">NEW</span>
                                )}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t">
                    <p className="text-xs text-muted-foreground text-center">© 2026 StockX Inc.</p>
                </div>
            </div>
        </div>
    );
}
