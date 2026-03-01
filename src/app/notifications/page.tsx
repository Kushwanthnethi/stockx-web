"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2, Heart, MessageSquare, UserPlus, Bell, CheckCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

import { API_BASE_URL } from "@/lib/config";

export default function NotificationsPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

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
                const accessToken = token || localStorage.getItem('accessToken');
                const res = await fetch(`${API_BASE_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
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
    }, [user, token]);

    // --- Actions ---

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            const accessToken = token || localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error("Failed to mark all as read", error);
        } finally {
            setMarkingAll(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );

        try {
            const accessToken = token || localStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    // --- Filtering for tabs ---

    const allNotifications = notifications;
    const mentionNotifications = useMemo(
        () => notifications.filter(n => n.type === 'COMMENT'),
        [notifications]
    );
    const systemNotifications = useMemo(
        () => notifications.filter(n => n.type === 'SYSTEM'),
        [notifications]
    );

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.read).length,
        [notifications]
    );

    // --- Helpers ---

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

    const getMessage = (type: string) => {
        switch (type) {
            case 'LIKE': return "liked your post";
            case 'COMMENT': return "commented on your post";
            case 'FOLLOW': return "started following you";
            default: return "sent you an update";
        }
    };

    if (authLoading) return null;

    // --- Render notification list ---

    const renderNotificationList = (items: any[], emptyIcon: React.ReactNode, emptyTitle: string, emptyDesc: string) => {
        if (loading) {
            return (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                        {emptyIcon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{emptyTitle}</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">{emptyDesc}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {items.map((n) => (
                    <Card
                        key={n.id}
                        className={`group relative overflow-hidden border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer ${n.read
                            ? "bg-card/30 opacity-75"
                            : "bg-card/50 hover:bg-card"
                            }`}
                        onClick={() => {
                            if (!n.read) handleMarkAsRead(n.id);
                            if (n.post) router.push(`/`);
                            else if (n.type === 'FOLLOW' && n.actor) router.push(`/u/${n.actor.handle}`);
                        }}
                    >
                        <div className="p-4 flex gap-4">
                            {/* Icon Indicator */}
                            <div className={`mt-1 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full shadow-lg ${getIconBg(n.type)} transition-transform group-hover:scale-110`}>
                                {getIcon(n.type)}
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-semibold text-sm hover:underline cursor-pointer truncate">
                                            {n.actor.firstName || n.actor.handle}
                                        </span>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                            {getMessage(n.type)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                {n.post && (
                                    <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50 truncate">
                                        &quot;{n.post.content.length > 80 ? n.post.content.substring(0, 80) + '...' : n.post.content}&quot;
                                    </div>
                                )}
                            </div>

                            {/* Unread Indicator Dot */}
                            {!n.read && (
                                <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30 animate-pulse" />
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <main className="grid grid-cols-1 lg:grid-cols-10 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-blue-500 text-white text-xs font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                            <p className="text-muted-foreground text-sm">Stay updated with your latest interactions.</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                            disabled={markingAll || unreadCount === 0}
                        >
                            {markingAll ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-1 h-3 w-3" />
                            )}
                            Mark all as read
                        </Button>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="all" className="rounded-lg">
                                All
                                {allNotifications.filter(n => !n.read).length > 0 && (
                                    <span className="ml-1.5 h-4 min-w-[16px] px-1 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-bold inline-flex items-center justify-center">
                                        {allNotifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="rounded-lg">
                                Mentions
                                {mentionNotifications.filter(n => !n.read).length > 0 && (
                                    <span className="ml-1.5 h-4 min-w-[16px] px-1 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-bold inline-flex items-center justify-center">
                                        {mentionNotifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="system" className="rounded-lg">System</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {renderNotificationList(
                                allNotifications,
                                <Bell className="h-10 w-10 text-muted-foreground/50" />,
                                "All caught up!",
                                "When you interact with the community, your notifications will appear here."
                            )}
                        </TabsContent>

                        <TabsContent value="mentions">
                            {renderNotificationList(
                                mentionNotifications,
                                <MessageSquare className="h-10 w-10 text-muted-foreground/50" />,
                                "No mentions yet",
                                "You haven't been mentioned in any discussions recently."
                            )}
                        </TabsContent>

                        <TabsContent value="system">
                            {renderNotificationList(
                                systemNotifications,
                                <TrendingUp className="h-10 w-10 text-muted-foreground/50" />,
                                "No system alerts",
                                "Security alerts and system updates will be shown here."
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-3 hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm">
                            <h3 className="font-semibold mb-2">Notification Settings</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Manage how you receive alerts and emails.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => router.push('/settings')}
                            >
                                Manage Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
