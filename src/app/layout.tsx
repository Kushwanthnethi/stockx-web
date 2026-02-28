import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://stocksx.info"),
    title: "StocksX – Indian Stock Market Analysis & Insights",
    description: "Where Indian investors share insights, not tips.",

    alternates: {
        canonical: "/",
    },
};

import { AuthProvider } from "@/providers/auth-provider";
import { GuestAuthModal } from "@/components/shared/guest-auth-modal";
import { SebiDisclaimerModal } from "@/components/shared/sebi-disclaimer-modal";
import { MaintenancePopup } from "@/components/shared/maintenance-popup";
import { SiteHeader } from "@/components/layout/site-header";

import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingPostButton } from "@/components/features/feed/floating-post-button";
import { MainLayout } from "@/components/layout/main-layout";
import { JsonLd } from "@/components/seo/json-ld";

import { SocketProvider } from "@/providers/socket-provider";
import { MarketAutoRefreshProvider } from "@/components/providers/market-auto-refresh-provider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    inter.className,
                    outfit.variable,
                    "min-h-screen bg-background font-sans antialiased"
                )}
                suppressHydrationWarning
            >
                <JsonLd />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <SocketProvider>
                            <MarketAutoRefreshProvider>
                                <MaintenancePopup />
                                <GuestAuthModal />
                                <SebiDisclaimerModal />
                                <SiteHeader />

                                <MainLayout>
                                    {children}
                                </MainLayout>

                                <BottomNav />
                                <Toaster theme="system" richColors closeButton position="top-center" />
                            </MarketAutoRefreshProvider>
                        </SocketProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
