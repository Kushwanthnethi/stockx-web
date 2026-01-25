"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Settings, TrendingUp, LogOut, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// We will reuse the MobileSheet logic or just link to profile for now.
// For X style, tapping avatar usually opens a drawer.
import { MobileSheet } from "@/components/layout/mobile-sheet"; // We can reuse or adapt this
import { Button } from "@/components/ui/button";

export function MobileHeader() {
    const { user, logout } = useAuth();

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-14 px-4 flex items-center justify-between transition-transform duration-300">
            {/* Left: Menu (Drawer Trigger) */}
            <div className="flex items-center">
                <MobileSheet />
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <span className="font-bold text-xl tracking-tight">StockX</span>
                </Link>
            </div>

            {/* Right: Profile or Login */}
            <div className="flex items-center">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="rounded-full overflow-hidden h-8 w-8 border border-border outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                                <img
                                    src={user.avatarUrl || "https://github.com/shadcn.png"}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/u/${user.handle}`} className="cursor-pointer w-full flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/login">
                        <Button variant="secondary" size="sm" className="font-semibold text-xs h-8 px-3 rounded-full">Log in</Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
