"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp } from "lucide-react";

export function PremiumGuard({ children }: { children: React.ReactNode }) {
    // Temporary bypass for AdSense Review
    return <>{children}</>;
}
