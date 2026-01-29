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

    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const shouldHideSidebar = isStockPage || isResultDetailPage || isAuthPage;

    return (
        <div
            className={cn(
                "flex items-start mx-auto min-h-[calc(100vh-3.5rem)]",
                // Only act as a container with padding for non-auth pages
                !isAuthPage && "container py-8 gap-8",

                // Home stays focused (max-w-7xl/1280px), others get full container width (max-w-2xl/1400px defined in tailwind config)
                // We let the 'container' class handle padding (2rem) for a professional consistent alignment
                isHomePage ? "max-w-7xl" : ""
            )}
        >
            {!shouldHideSidebar && <AppSidebar className="sticky top-20 w-56 shrink-0" />}
            <main className="flex-1 min-w-0 w-full">
                {children}
            </main>
        </div>
    );
}
