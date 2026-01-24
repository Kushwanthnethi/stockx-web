import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "StocksX – Indian Stock Market Analysis & Insights",
    description: "Where Indian investors share insights, not tips.",
};

import { AuthProvider } from "@/providers/auth-provider";
import { GuestAuthModal } from "@/components/shared/guest-auth-modal";

// ... (imports)

import { ThemeProvider } from "@/components/theme-provider";

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
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
