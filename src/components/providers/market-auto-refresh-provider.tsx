"use client";

import { useMarketAutoRefresh } from "@/hooks/use-market-auto-refresh";

export function MarketAutoRefreshProvider({ children }: { children: React.ReactNode }) {
    useMarketAutoRefresh();

    return <>{children}</>;
}
