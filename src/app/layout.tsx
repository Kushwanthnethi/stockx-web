import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "StocksX – Indian Stock Market Analysis & Insights",
    description: "Where Indian investors share insights, not tips.",
    icons: {
        icon: "/favicon.png",
    },
};

import { AuthProvider } from "@/providers/auth-provider";
import { GuestAuthModal } from "@/components/shared/guest-auth-modal";
import { SiteHeader } from "@/components/layout/site-header";

// ... (imports)

import { ThemeProvider } from "@/components/theme-provider";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingPostButton } from "@/components/features/feed/floating-post-button";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}
                suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <GuestAuthModal />
                        <SiteHeader />

                        <div className="container flex items-start gap-8 px-4 py-6 max-w-7xl mx-auto min-h-[calc(100vh-3.5rem)]">
                            <AppSidebar className="sticky top-20 w-56 shrink-0" />
                            <main className="flex-1 min-w-0 w-full">
                                {children}
                            </main>
                        </div>

                        <FloatingPostButton />
                        <BottomNav />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
