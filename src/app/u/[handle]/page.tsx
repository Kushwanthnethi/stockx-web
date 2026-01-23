"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedPost } from "@/components/features/feed/feed-post";
import { ProfileHeader } from "@/components/features/profile/profile-header";
import { SiteHeader } from "@/components/layout/site-header";
import Link from "next/link";
import { ActivityGraph } from "@/components/features/profile/activity-graph";
import { API_BASE_URL } from "@/lib/config";

export default function ProfilePage() {
    const { handle } = useParams();
    const { user: currentUser, token } = useAuth();
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
            <SiteHeader />

            <ProfileHeader
                profile={profile}
                isOwner={isOwner}
                isFollowing={isFollowing}
                onFollowToggle={handleFollow}
                followLoading={followLoading}
            />

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
                            value="replies"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Replies
                        </TabsTrigger>
                        <TabsTrigger
                            value="media"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium transition-all"
                        >
                            Media
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

                    <TabsContent value="replies" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
                            Replies will appear here.
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Placeholder for media grid */}
                            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                            <div className="aspect-square bg-muted rounded-lg animate-pulse delay-75" />
                            <div className="aspect-square bg-muted rounded-lg animate-pulse delay-150" />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
