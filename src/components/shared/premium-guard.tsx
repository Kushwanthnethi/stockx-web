"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp } from "lucide-react";

export function PremiumGuard({ children }: { children: React.ReactNode }) {
    const { user, setShowLoginModal, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <span className="w-12 h-12 rounded-full bg-muted"></span>
                    <span className="h-4 w-32 bg-muted rounded"></span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="bg-background border border-border/50 p-6 rounded-full relative shadow-2xl">
                        <Lock className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <div className="space-y-3 max-w-md">
                    <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
                        Restricted Access
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        This deep-dive analysis is exclusive to our members. Join StockX to unlock high-conviction ideas and expert verdicts.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                        size="lg"
                        onClick={() => setShowLoginModal(true)}
                        className="w-full font-bold text-base shadow-lg hover:shadow-primary/20 transition-all rounded-full"
                    >
                        Login / Sign Up
                    </Button>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        Join 1000+ Investors
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
