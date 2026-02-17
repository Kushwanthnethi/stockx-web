"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { UserNav } from "@/components/layout/user-nav";
import { CommandMenu } from "@/components/shared/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSheet } from "./mobile-sheet";

function AuthButtons() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />;

    if (user) {
        return <UserNav />;
    }

    return (
        <>
            <Link href="/login">
                <Button variant="ghost" className="text-sm px-4 md:px-3 h-9 md:h-8 font-medium">Log In</Button>
            </Link>
            <Link href="/signup">
                <Button className="text-sm px-4 md:px-3 h-9 md:h-8 font-medium">Sign Up</Button>
            </Link>
        </>
    );
}

import { usePathname } from "next/navigation";

export function SiteHeader() {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/signup";

    if (isAuthPage) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 md:h-14 items-center justify-between px-1.5 lg:container max-w-7xl mx-auto">
                <div className="flex items-center gap-0.5 md:gap-1">
                    <MobileSheet />
                    <Link href="/" className="font-bold text-xl md:text-xl tracking-tighter flex items-center gap-1.5 md:gap-1">
                        <TrendingUp className="text-green-600 h-[26px] w-[26px] md:h-6 md:w-6" />
                        StocksX
                    </Link>
                </div>
                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <CommandMenu />
                        </div>
                        <div className="hidden md:flex">
                            <ModeToggle />
                        </div>
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </header>
    );
}
