"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <div
            className={cn(
                "flex items-start gap-8 px-4 py-6 mx-auto min-h-[calc(100vh-3.5rem)]",
                isHomePage ? "container max-w-7xl" : "w-full max-w-[1500px]"
            )}
        >
            <AppSidebar className="sticky top-20 w-56 shrink-0" />
            <main className="flex-1 min-w-0 w-full">
                {children}
            </main>
        </div>
    );
}
