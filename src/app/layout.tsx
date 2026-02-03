import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://www.stocksx.info"),
    title: "StocksX – Indian Stock Market Analysis & Insights",
    description: "Where Indian investors share insights, not tips.",

    alternates: {
        canonical: "/",
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
import { MainLayout } from "@/components/layout/main-layout";
import { JsonLd } from "@/components/seo/json-ld";

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
                <JsonLd />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <GuestAuthModal />
                        <SiteHeader />

                        <MainLayout>
                            {children}
                        </MainLayout>

                        <FloatingPostButton />
                        <BottomNav />
                        <Toaster theme="system" richColors closeButton position="top-center" />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
