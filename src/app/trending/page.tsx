"use client";

import React from "react";
import { TrendingWidget } from "@/components/features/stocks/trending-widget";

export default function TrendingPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-2xl mx-auto px-4 py-6 pt-20">
                <h1 className="text-2xl font-bold mb-6">Trending Stocks</h1>
                <TrendingWidget />
            </div>
        </div>
    );
}
