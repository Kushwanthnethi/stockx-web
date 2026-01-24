"use client";

import React from "react";
import { NewsWidget } from "@/components/features/news/news-widget";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Note: Layout already includes Header/BottomNav, but we might need padding or specific structural adjustments if the layout wraps this page */}
            {/* Since layout.tsx adds MobileHeader and BottomNav globally, we just need the content here with padding */}

            <div className="container max-w-2xl mx-auto px-4 py-6 pt-20">
                <h1 className="text-2xl font-bold mb-6">Market News</h1>
                <NewsWidget />
            </div>
        </div>
    );
}
