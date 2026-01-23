"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2, Heart, MessageSquare, UserPlus, Bell, CheckCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotificationsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/notifications");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch('http://localhost:3333/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart className="h-4 w-4 text-white" />;
            case 'COMMENT': return <MessageSquare className="h-4 w-4 text-white" />;
            case 'FOLLOW': return <UserPlus className="h-4 w-4 text-white" />;
            default: return <Bell className="h-4 w-4 text-white" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'LIKE': return "bg-rose-500 shadow-rose-500/20";
            case 'COMMENT': return "bg-blue-500 shadow-blue-500/20";
            case 'FOLLOW': return "bg-green-500 shadow-green-500/20";
            default: return "bg-slate-500 shadow-slate-500/20";
        }
    };

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
                            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground text-sm">Stay updated with your latest interactions.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all as read
                        </Button>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                            <TabsTrigger value="mentions" className="rounded-lg">Mentions</TabsTrigger>
                            <TabsTrigger value="system" className="rounded-lg">System</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((n) => (
                                        <Card key={n.id} className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300">
                                            <div className="p-4 flex gap-4">
                                                {/* Icon Indicator */}
                                                <div className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full shadow-lg ${getIconBg(n.type)} transition-transform group-hover:scale-110`}>
                                                    {getIcon(n.type)}
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm hover:underline cursor-pointer">
                                                                {n.actor.firstName || n.actor.handle}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {n.type === 'LIKE' && "liked your post"}
                                                                {n.type === 'COMMENT' && "commented on your post"}
                                                                {n.type === 'FOLLOW' && "started following you"}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground tabular-nums">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    {n.post && (
                                                        <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                                                            "{n.post.content.length > 80 ? n.post.content.substring(0, 80) + '...' : n.post.content}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Unread Indicator Dot (Mock logic) */}
                                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                                        <Bell className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">All caught up!</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            When you interact with the community, your notifications will appear here.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="mentions">
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">No mentions yet</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        You haven't been mentioned in any discussions recently.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="system">
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                                    <TrendingUp className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">No system alerts</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        Security alerts and system updates will be shown here.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar (Optional / Trending) */}
                <div className="lg:col-span-3 hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm">
                            <h3 className="font-semibold mb-2">Notification Settings</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Manage how you receive alerts and emails.
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                                Manage Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
