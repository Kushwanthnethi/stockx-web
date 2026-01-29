"use client";

import React, { useState, useEffect } from 'react';
import { VerdictCard, VerdictType } from '@/components/features/verdict/verdict-card';
import { Sparkles, RefreshCw, Search, ArrowDownCircle, Layers, TrendingUp, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { PremiumGuard } from "@/components/shared/premium-guard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface VerdictData {
    id: string;
    stockId: string; // symbol
    verdict: VerdictType;
    catalyst: string;
    headline: string;
    rationale: string;
    updatedAt: string;
    stock?: {
        companyName: string;
        currentPrice: number;
        changePercent: number;
    }
}

export default function VerdictPage() {
    const [activeTab, setActiveTab] = useState<'large' | 'mid'>('large');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [verdicts, setVerdicts] = useState<VerdictData[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch Verdicts
    const fetchVerdicts = async (category: 'large' | 'mid') => {
        setLoading(true);
        setError(null);
        try {
            const catParam = category === 'large' ? 'LARGE_CAP' : 'MID_CAP';
            const res = await fetch(`${API_BASE_URL}/verdicts?category=${catParam}`);
            if (!res.ok) throw new Error('Failed to fetch verdicts');
            const data = await res.json();

            // Transform to match UI needs
            const mapped = data.map((v: any) => ({
                id: v.id,
                stockId: v.stockId,
                verdict: v.verdict as VerdictType,
                catalyst: v.catalyst,
                headline: v.headline,
                rationale: v.rationale,
                updatedAt: v.updatedAt,
                stock: v.stock
            }));
            setVerdicts(mapped);
        } catch (err) {
            console.error(err);
            setError("Failed to load AI verdicts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerdicts(activeTab);
    }, [activeTab]);

    const filteredVerdicts = verdicts.filter(v =>
        v.stockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.stock?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black/95 text-white pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-black border-b border-white/5 pt-24 pb-12 px-4">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium animate-pulse">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Analyst Updates Weekly</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        The Verdict
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
                        Institutional-grade analysis for everyday investors. We process thousands of data points to give you a clear <span className="text-white font-medium">BUY, SELL, or HOLD</span> call.
                    </p>

                    {/* Stats / Info Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8 text-sm">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex items-center justify-center gap-3">
                            <Layers className="w-5 h-5 text-purple-400" />
                            <div className="text-left">
                                <div className="text-gray-400 text-xs">Coverage</div>
                                <div className="font-semibold">Nifty 100 Stocks</div>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex items-center justify-center gap-3">
                            <RefreshCw className="w-5 h-5 text-blue-400" />
                            <div className="text-left">
                                <div className="text-gray-400 text-xs">Update Frequency</div>
                                <div className="font-semibold">Every Sunday</div>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex items-center justify-center gap-3">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <div className="text-left">
                                <div className="text-gray-400 text-xs">Success Rate</div>
                                <div className="font-semibold">72% Historical Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    {/* Tabs */}
                    <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                        <button
                            onClick={() => setActiveTab('large')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                activeTab === 'large'
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                            suppressHydrationWarning
                        >
                            Large Cap
                        </button>
                        <button
                            onClick={() => setActiveTab('mid')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                activeTab === 'mid'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                            suppressHydrationWarning
                        >
                            Mid Cap
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <Input
                            placeholder={`Search ${activeTab === 'large' ? 'Large' : 'Mid'} Cap stocks...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all rounded-xl h-11"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-red-500/20">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong.</h3>
                        <p className="text-gray-400">{error}</p>
                        <Button onClick={() => fetchVerdicts(activeTab)} className="mt-6 bg-white/10 hover:bg-white/20">
                            Try Again
                        </Button>
                    </div>
                ) : filteredVerdicts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white">No verdicts found</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVerdicts.map((item, idx) => (
                            <VerdictCard
                                key={item.id || idx}
                                symbol={item.stockId}
                                companyName={item.stock?.companyName || item.stockId}
                                price={item.stock?.currentPrice ? `₹${item.stock.currentPrice.toFixed(2)}` : "N/A"}
                                change={item.stock?.changePercent ? `${item.stock.changePercent.toFixed(2)}%` : "0%"}
                                isPositiveChange={(item.stock?.changePercent || 0) >= 0}
                                verdict={item.verdict}
                                catalyst={item.catalyst}
                                headline={item.headline}
                                rationale={item.rationale}
                                date={new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'mid' && !loading && (
                    <div className="mt-12">
                        <PremiumGuard>
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
                                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Unlock Hidden Gems</h3>
                                <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                                    Upgrade to Pro to access our exclusive Small Cap & Micro Cap verdicts, aiming for 10x returns.
                                </p>
                                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-yellow-500/20">
                                    Go Premium Today
                                </Button>
                            </div>
                        </PremiumGuard>
                    </div>
                )}

            </div>
        </div>
    );
}
