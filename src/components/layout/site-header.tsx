"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { UserNav } from "@/components/layout/user-nav";
import { CommandMenu } from "@/components/shared/command-menu";
import { MobileSheet } from "./mobile-sheet";
import { Logo } from "@/components/shared/logo";

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
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

    if (isAuthPage) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 md:h-14 items-center justify-between px-4 md:px-8 max-w-[1440px] mx-auto w-full">
                <div className="flex items-center gap-0.5 md:gap-1">
                    <MobileSheet />
                    <Logo />
                </div>
                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="flex items-center gap-2">
                        <CommandMenu />
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </header>
    );
}
