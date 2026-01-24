"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Settings, TrendingUp } from "lucide-react";
// We will reuse the MobileSheet logic or just link to profile for now.
// For X style, tapping avatar usually opens a drawer.
import { MobileSheet } from "@/components/layout/mobile-sheet"; // We can reuse or adapt this
import { Button } from "@/components/ui/button";

export function MobileHeader() {
    const { user } = useAuth();

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-14 px-4 flex items-center justify-between transition-transform duration-300">
            {/* Left: Avatar (Drawer Trigger) or Login */}
            <div className="flex items-center">
                {user ? (
                    <div className="relative">
                        <MobileSheet trigger={
                            <button className="rounded-full overflow-hidden h-8 w-8 border border-border">
                                <img
                                    src={user.avatarUrl || "https://github.com/shadcn.png"}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        } />
                    </div>
                ) : (
                    <Link href="/login">
                        <Button variant="secondary" size="sm" className="font-semibold text-xs h-8 px-3 rounded-full">Log in</Button>
                    </Link>
                )}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <span className="font-bold text-xl tracking-tight">StockX</span>
                </Link>
            </div>

            {/* Right: Settings / Actions or Sign Up */}
            <div className="flex items-center">
                {user ? (
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                ) : (
                    <Link href="/signup">
                        <Button size="sm" className="h-7 text-xs px-3 rounded-full">Sign up</Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
