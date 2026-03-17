import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://stocksx.info"),
    title: "StocksX – Indian Stock Market Analysis & Insights",
    description: "StocksX is an Indian stock market analysis and investor community platform with portfolio tracking, AI verdicts, result calendars, and actionable market insights.",

    alternates: {
        canonical: "/",
    },
};

import { AuthProvider } from "@/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";

import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MainLayout } from "@/components/layout/main-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { DeferredGlobalOverlays } from "@/components/providers/deferred-global-overlays";

import { SocketProvider } from "@/providers/socket-provider";
import { MarketAutoRefreshProvider } from "@/components/providers/market-auto-refresh-provider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5478712261072383"
                    crossOrigin="anonymous"
                ></script>
            </head>
            <body
                className={cn(
                    inter.className,
                    inter.variable,
                    jetbrains.variable,
                    plusJakartaSans.variable,
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
                                <DeferredGlobalOverlays />
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
