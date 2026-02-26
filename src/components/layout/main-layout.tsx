"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isStockPage = pathname?.startsWith("/stock/");
    // Only hide sidebar on result detail pages (e.g., /results/LT), not the main listing (/results)
    const isResultDetailPage = pathname?.startsWith("/results/") && pathname !== "/results";

    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
    const shouldHideSidebar = isStockPage || isResultDetailPage || isAuthPage;

    return (
        <div
            className={cn(
                "flex items-start mx-auto w-full",
                isAuthPage ? "min-h-screen" : "min-h-[calc(100vh-3.5rem)]",
                // Mobile: Full width without stacked padding. Desktop: Constrained max-width container.
                !isAuthPage && "max-w-[1440px] px-4 md:px-8 lg:py-8 lg:gap-8"
            )}
        >
            {!shouldHideSidebar && <AppSidebar className="sticky top-20 w-56 shrink-0" />}
            <main className={cn(
                "flex-1 min-w-0 w-full lg:px-0",
                isAuthPage ? "pb-0" : "pb-28 lg:pb-0"
            )}>
                {children}
            </main>
        </div >
    );
}
