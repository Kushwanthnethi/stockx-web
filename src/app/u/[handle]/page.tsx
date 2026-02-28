"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { FeedPost } from "@/components/features/feed/feed-post";
import { ProfileHeader } from "@/components/features/profile/profile-header";

import Link from "next/link";
import { ActivityGraph } from "@/components/features/profile/activity-graph";
import { API_BASE_URL } from "@/lib/config";

export default function ProfilePage() {
    const { handle } = useParams();
    const { user: currentUser, token, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [visits, setVisits] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!handle) return;
            try {
                // Fetch Profile
                const res = await fetch(`${API_BASE_URL}/users/profile/${handle}`);
                let profileId = null;

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    profileId = data.id;

                    // Fetch Visits
                    const resVisits = await fetch(`${API_BASE_URL}/users/${profileId}/visits`);
                    if (resVisits.ok) {
                        setVisits(await resVisits.json());
                    }
                }

                // Fetch Posts (Mocking for now or generic feed filtered)
                // ideally GET /users/:handle/posts
                const resPosts = await fetch(`${API_BASE_URL}/posts`); // Temporary
                if (resPosts.ok) {
                    const allPosts = await resPosts.json();
                    const userPosts = allPosts.filter((p: any) => p.user?.handle === handle);
                    setPosts(userPosts);
                }

                // Check Follow Status
                if (currentUser && token && profileId) {
                    const resFollow = await fetch(`${API_BASE_URL}/users/${profileId}/is-following`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resFollow.ok) {
                        const followData = await resFollow.json();
                        setIsFollowing(followData.isFollowing);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [handle, currentUser, token]);

    const handleFollow = async () => {
        if (!currentUser || !profile) return;
        setFollowLoading(true);
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const res = await fetch(`${API_BASE_URL}/users/${profile.id}/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error("Failed to toggle follow", error);
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
        );
    }

    if (!profile) {
        return <div className="container max-w-4xl mx-auto py-8 px-4 text-center">User not found</div>;
    }

    const isOwner = currentUser?.handle === profile.handle;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}


            <ProfileHeader
                profile={profile}
                isOwner={isOwner}
                isFollowing={isFollowing}
                onFollowToggle={handleFollow}
                followLoading={followLoading}
            />

            {/* Mobile Sign Out Button */}
            {isOwner && (
                <div className="md:hidden px-4 mb-4">
                    <Button variant="destructive" className="w-full gap-2" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            )}


            <div className="container max-w-5xl mx-auto px-4">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 mb-8 overflow-x-auto scrollbar-hide">
                        <TabsTrigger
                            value="overview"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="posts"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Posts
                        </TabsTrigger>
                        <TabsTrigger
                            value="watchlist"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Watchlist
                        </TabsTrigger>
                        <TabsTrigger
                            value="portfolio"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Portfolio
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Contribution/Activity Graph */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Activity</h2>
                            <ActivityGraph data={visits} />
                        </div>

                        {/* Recent Posts Snippet - Reuse Feed but limited? or just posts */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Recent Posts</h2>
                            {posts.length > 0 ? (
                                <div className="space-y-4">
                                    {posts.slice(0, 3).map(post => (
                                        <FeedPost key={post.id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground bg-card p-6 rounded-xl border border-dashed text-center">
                                    No posts yet.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="posts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <FeedPost key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                No posts to show.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="watchlist" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="p-4 bg-muted/30 rounded-full">
                                    {/* Placeholder icon */}
                                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Watchlist is private</h3>
                                <p className="text-sm">Only {profile.firstName} can see their watchlist items.</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="portfolio" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="p-4 bg-muted/30 rounded-full">
                                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Portfolio is private</h3>
                                <p className="text-sm">Public portfolios are coming soon to StockX.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
