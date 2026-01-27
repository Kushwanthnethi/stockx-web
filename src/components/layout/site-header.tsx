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
                <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
                <Button size="sm">Sign Up</Button>
            </Link>
        </>
    );
}

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-1">
                    <MobileSheet />
                    <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-1">
                        <TrendingUp className="text-green-600" />
                        StockX
                    </Link>
                </div>
                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <CommandMenu />
                        </div>
                        <ModeToggle />
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </header>
    );
}
