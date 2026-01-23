"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { FeedPost } from "../feed/feed-post";

interface StockInsightsProps {
    symbol: string;
}

export function StockInsights({ symbol }: StockInsightsProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Fetch posts that mention this stock (e.g. $RELIANCE)
                const res = await fetch(`http://localhost:3333/posts/symbol/${symbol}`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error("Failed to fetch stock insights", error);
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchPosts();
        }
    }, [symbol]);

    if (loading) {
        return (
            <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12 bg-card border border-border rounded-xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Be the first to share your thoughts on ${symbol.split('.')[0]}!
                    Head to the home page to create a post.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Insights
            </h3>
            <div className="space-y-4">
                {posts.map((post) => (
                    <FeedPost key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
