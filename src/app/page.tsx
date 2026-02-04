"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Heart, Share2, TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StockBadge } from "@/components/shared/stock-badge";
import { getFeedPosts, type Post } from "@/mocks/handlers";
import { FeedPost } from "@/components/features/feed/feed-post";
import { useAuth } from "@/providers/auth-provider";
import { UserNav } from "@/components/layout/user-nav";
import { NewsWidget } from "@/components/features/news/news-widget";
import { ProfileWidget } from "@/components/features/profile/profile-widget";

import { ModeToggle } from "@/components/mode-toggle";
import { TrendingWidget } from "@/components/features/stocks/trending-widget";
import { IndicesTicker } from "@/components/features/stocks/indices-ticker";
import { WatchlistWidget } from "@/components/features/stocks/watchlist-widget";
import { CreatePost } from "@/components/features/feed/create-post";
import { API_BASE_URL } from "@/lib/config";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { AnimatePresence } from "framer-motion";

function FeedSidebar() {
    return (
        <div className="hidden lg:block w-80 space-y-6 h-full">
            {/* Watchlist Widget */}
            <WatchlistWidget />

            {/* Trending Box */}
            <TrendingWidget />

            {/* News Widget - Now Static */}
            <NewsWidget />

            {/* Profile Widget & Footer (Sticky) */}
            <div className="sticky top-[5.5rem] space-y-6 z-10">
                <ProfileWidget />

                {/* Footer / Legal */}
                <div className="text-xs text-muted-foreground px-2 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                        <Link href="/legal/terms" className="hover:underline hover:text-foreground transition-colors">Terms of Service</Link>
                        <span>·</span>
                        <Link href="/legal/privacy" className="hover:underline hover:text-foreground transition-colors">Privacy Policy</Link>
                        <span>·</span>
                        <Link href="/legal/cookies" className="hover:underline hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                    <p>© 2026 StockX Inc.</p>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const fetchPosts = async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (pageNum === 1) setLoading(true); // Only show main loader on first load/refresh

            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/posts?page=${pageNum}&limit=20`, {
                headers
            });

            if (res.ok) {
                const data = await res.json();

                if (data.length < 20) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (pageNum === 1 || isRefresh) {
                    setPosts(data);
                } else {
                    setPosts(prev => [...prev, ...data]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPosts(1);
    }, []);

    // Infinite Scroll Hook
    useIntersectionObserver({
        target: loadMoreRef,
        onIntersect: () => {
            if (hasMore && !loading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchPosts(nextPage);
            }
        },
        enabled: hasMore && !loading
    });

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">


            {/* Main Content Layout */}
            <main className="grid grid-cols-1 lg:grid-cols-10 gap-8">

                {/* Center Feed */}
                <div className="lg:col-span-7">
                    <h1 className="hidden md:block text-lg md:text-2xl font-bold mb-4 text-foreground">
                        Indian Stock Market Analysis & Investor Insights
                    </h1>

                    {/* Live Indices Ticker */}
                    <IndicesTicker />

                    {/* Create Post Input (Desktop Only) */}
                    <div className="mb-6">
                        {user && (
                            <CreatePost
                                onPostCreated={() => { }} // Deprecated in favor of optimistic handlers
                                onOptimisticAdd={(newPost: any) => {
                                    setPosts(prev => [newPost, ...prev]);
                                    // Scroll to top smoothly
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onPostSuccess={(tempId: string, realPost: any) => {
                                    setPosts(prev => prev.map(p => p.id === tempId ? realPost : p));
                                }}
                                onPostError={(tempId: string) => {
                                    setPosts(prev => prev.filter(p => p.id !== tempId));
                                    // Optional: Toast error here
                                }}
                            />
                        )}
                    </div>

                    {/* Posts Feed */}
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 rounded-lg bg-card animate-pulse border border-border" />
                                ))}
                            </div>
                        ) : posts.length > 0 ? (
                            posts.map(post => {
                                // Prepare user object
                                const postUser = {
                                    id: post.user?.id || 'unknown',
                                    name: post.user?.firstName || post.user?.handle || 'Anonymous',
                                    handle: post.user?.handle || 'anon',
                                    avatarUrl: post.user?.avatarUrl,
                                    isVerified: post.user?.isVerified,
                                    verified: post.user?.verified
                                };

                                return (
                                    <FeedPost key={post.id} post={{
                                        ...post,
                                        user: postUser,
                                        timestamp: formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                                    }} />
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p className="text-lg font-medium">No posts yet</p>
                                <p>Be the first to share your market insights!</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Infinite Scroll Sensor & Loader */}
                    <div ref={loadMoreRef} className="flex flex-col items-center justify-center p-8 space-y-3">
                        {hasMore && posts.length > 0 && (
                            <>
                                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span className="text-muted-foreground text-xs font-medium tracking-wide animate-pulse">
                                    ANALYZING MARKET DATA...
                                </span>
                            </>
                        )}
                    </div>

                    {/* End of Feed Disclaimer */}
                    <div className="mt-8 p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900 text-yellow-800 dark:text-yellow-500 text-xs flex gap-2 items-start">
                        <Info size={16} className="mt-0.5 flex-shrink-0" />
                        <p>
                            <strong>Disclaimer:</strong> Content on StockX is for educational purposes only.
                            No content here constitutes financial advice or a recommendation to buy/sell equities.
                            Please consult a SEBI registered investment advisor before making trades.
                        </p>
                    </div>

                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-3 h-full">
                    <FeedSidebar />
                </div>

            </main>
        </div>
    );
}
