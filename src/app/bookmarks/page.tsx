"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { FeedPost } from "@/components/features/feed/feed-post";
import { Loader2, ArrowLeft, Bookmark, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { API_BASE_URL } from "@/lib/config";

export default function BookmarksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const [postsRes, stocksRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/posts/user/bookmarks`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/stocks/user/${user.id}/watchlist`)
                ]);

                if (postsRes.ok) {
                    const data = await postsRes.json();
                    setBookmarks(data);
                }

                if (stocksRes.ok) {
                    const data = await stocksRes.json();
                    // Each item is { id, userId, stockSymbol, createdAt, stock: {...} }
                    setWatchlist(data);
                }

            } catch (error) {
                console.error("Failed to fetch bookmarks/watchlist", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Sticky Header */}
            <SiteHeader />

            <main className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
                            <p className="text-muted-foreground text-sm">Saved posts and market insights.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="posts" className="rounded-lg">Saved Posts</TabsTrigger>
                            <TabsTrigger value="stocks" className="rounded-lg">Watchlisted Stocks</TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : bookmarks.length > 0 ? (
                                <div className="space-y-6">
                                    {bookmarks.map((post) => (
                                        <FeedPost key={post.id} post={{ ...post, bookmarkedByMe: true }} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-card/30">
                                    <div className="h-20 w-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                                        <Bookmark className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">No saved posts</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                        Bookmark interesting discussions and analysis to read them later.
                                    </p>
                                    <Link href="/">
                                        <Button>Explore Feed</Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="stocks">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : watchlist.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {watchlist.map((item) => (
                                        <Link href={`/stock/${item.stockSymbol}`} key={item.id}>
                                            <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-xs text-primary">
                                                        {item.stockSymbol.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{item.stockSymbol}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.stock?.companyName || 'Stock'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-sm">
                                                        ₹{item.stock?.currentPrice?.toFixed(2) || '-'}
                                                    </div>
                                                    <div className={item.stock?.changePercent >= 0 ? "text-xs text-green-500" : "text-xs text-red-500"}>
                                                        {item.stock?.changePercent >= 0 ? "+" : ""}{item.stock?.changePercent?.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-card/30">
                                    <div className="h-20 w-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                                        <Folder className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Watchlist is empty</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                        Start tracking your favorite stocks to see them here.
                                    </p>
                                    <Link href="/explore">
                                        <Button variant="outline">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add to Watchlist
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar (Stats/Quick Links) */}
                <div className="lg:col-span-3 hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
                            <h3 className="font-bold text-lg mb-2">Collections</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Organize your saved items into custom collections for better research.
                            </p>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25">
                                Create Collection
                            </Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
