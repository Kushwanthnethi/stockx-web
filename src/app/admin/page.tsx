"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Users, FileText, TrendingUp, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/features/admin/stats-card";
import { UsersTable } from "@/components/features/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function AdminPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchStats();
            fetchPosts();
        }
    }, [user]);

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
                // Update stats locally or refetch
                setStats((prev: any) => prev ? { ...prev, totalPosts: prev.totalPosts - 1 } : prev);
            } else {
                alert("Failed to delete post");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting post");
        }
    };

    if (isLoading || !user || user.role !== 'ADMIN') return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShieldAlert className="text-primary h-8 w-8" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">Overview of system metrics and management</p>
                    </div>
                    <Button variant="outline" onClick={async () => {
                        await logout();
                        router.push('/login');
                    }}>
                        Logout
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={Users}
                        description="Registered accounts"
                    />
                    <StatsCard
                        title="Active Today"
                        value={stats?.activeUsers || 0}
                        icon={Activity}
                        description="Unique visitors today"
                    />
                    <StatsCard
                        title="Total Posts"
                        value={stats?.totalPosts || 0}
                        icon={FileText}
                        description="Content generated"
                    />
                    <StatsCard
                        title="Stocks Tracked"
                        value={stats?.totalStocks || 0}
                        icon={TrendingUp}
                        description="Market entities"
                    />
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="content">Content Moderation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest posts from the community</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {posts.slice(0, 5).map(post => (
                                        <div key={post.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 overflow-hidden">
                                                    <img src={post.user?.avatarUrl || "https://github.com/shadcn.png"} alt="User" className="h-full w-full object-cover" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">{post.user?.firstName} {post.user?.lastName}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>Manage user accounts and permissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UsersTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Management</CardTitle>
                                <CardDescription>Review and delete inappropriate content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {posts.map(post => (
                                        <div key={post.id} className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                                <img src={post.user?.avatarUrl || "https://github.com/shadcn.png"} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{post.user?.firstName}</span>
                                                    <span className="text-muted-foreground text-sm">@{post.user?.handle}</span>
                                                    <span className="text-muted-foreground text-sm">· {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                <p className="text-foreground mb-2 whitespace-pre-line">{post.content}</p>
                                                {post.imageUrl && (
                                                    <img src={post.imageUrl} className="h-32 rounded-md object-cover border mb-2" />
                                                )}
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeletePost(post.id)}
                                                className="shrink-0"
                                            >
                                                <Trash2 size={16} className="mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
