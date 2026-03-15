"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    ShieldAlert,
    Users,
    FileText,
    TrendingUp,
    Activity,
    Trash2,
    RefreshCw,
    Download,
    Search,
    AlertTriangle,
    ShieldCheck,
    Clock3,
    ServerCog,
    Database,
    UserRound,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    BarChart,
    Bar,
} from "recharts";

import { useAuth } from "@/providers/auth-provider";
import { API_BASE_URL } from "@/lib/config";
import { UsersTable } from "@/components/features/admin/users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RiskLevel = "safe" | "review" | "high";

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalStocks: number;
}

interface AdminPost {
    id: string;
    content: string;
    createdAt: string;
    imageUrl?: string | null;
    user?: {
        firstName?: string;
        lastName?: string;
        handle?: string;
        avatarUrl?: string;
    };
}

interface ModerationPost extends AdminPost {
    risk: RiskLevel;
}

interface AdminInsights {
    growth: {
        users7d: number;
        usersDeltaPct: number;
        posts7d: number;
        postsDeltaPct: number;
    };
    trends: {
        dailyUsers: Array<{
            key: string;
            label: string;
            newUsers: number;
            activeUsers: number;
        }>;
        hourlyPosts: Array<{
            label: string;
            posts: number;
        }>;
    };
    moderation: {
        safe: number;
        review: number;
        high: number;
    };
    market: {
        pricedStocks: number;
        freshStocks: number;
        movers: {
            gainers: number;
            losers: number;
        };
    };
    systemHealth: {
        score: number;
        staleStocks: number;
        highRiskQueue: number;
    };
    topAuthors: Array<{
        handle: string;
        name: string;
        posts: number;
    }>;
}

const HIGH_RISK_TERMS = ["scam", "fraud", "hate", "kill", "attack", "nsfw", "terror"];
const REVIEW_TERMS = ["rumor", "leak", "insider", "manipulate", "panic", "dump", "pump"];

const riskBadgeClasses: Record<RiskLevel, string> = {
    safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    review: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    high: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
};

const riskDotClasses: Record<RiskLevel, string> = {
    safe: "bg-emerald-500",
    review: "bg-amber-500",
    high: "bg-red-500",
};

const inferRiskLevel = (content: string): RiskLevel => {
    const normalized = content.toLowerCase();
    if (HIGH_RISK_TERMS.some((term) => normalized.includes(term))) return "high";
    if (REVIEW_TERMS.some((term) => normalized.includes(term))) return "review";
    return "safe";
};

export default function AdminPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [insights, setInsights] = useState<AdminInsights | null>(null);
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [postSearch, setPostSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
    const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== "ADMIN") {
                router.push("/");
            }
        }
    }, [user, isLoading, router]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data: AdminStats = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data: AdminPost[] = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchInsights = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/admin/insights`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data: AdminInsights = await res.json();
                setInsights(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const refreshDashboard = async () => {
        setIsRefreshing(true);
        await Promise.allSettled([fetchStats(), fetchPosts(), fetchInsights()]);
        setLastSyncedAt(new Date());
        setIsRefreshing(false);
    };

    useEffect(() => {
        if (user?.role === "ADMIN") {
            refreshDashboard();
        }
    }, [user]);

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.id !== postId));
                setStats((prev) => (prev ? { ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) } : prev));
            } else {
                alert("Failed to delete post");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting post");
        }
    };

    const enrichedPosts = useMemo<ModerationPost[]>(() => {
        return [...posts]
            .map((post) => ({ ...post, risk: inferRiskLevel(post.content || "") }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [posts]);

    const moderationMetrics = useMemo(() => {
        const high = enrichedPosts.filter((post) => post.risk === "high").length;
        const review = enrichedPosts.filter((post) => post.risk === "review").length;
        const safe = enrichedPosts.filter((post) => post.risk === "safe").length;
        const postsToday = enrichedPosts.filter((post) => {
            const age = Date.now() - new Date(post.createdAt).getTime();
            return age <= 24 * 60 * 60 * 1000;
        }).length;
        const averagePostLength =
            enrichedPosts.length > 0
                ? Math.round(enrichedPosts.reduce((acc, post) => acc + (post.content?.length || 0), 0) / enrichedPosts.length)
                : 0;
        const total = enrichedPosts.length;

        return {
            high,
            review,
            safe,
            postsToday,
            averagePostLength,
            total,
            highPct: total ? Math.round((high / total) * 100) : 0,
            reviewPct: total ? Math.round((review / total) * 100) : 0,
            safePct: total ? Math.round((safe / total) * 100) : 0,
        };
    }, [enrichedPosts]);

    const healthTone = useMemo(() => {
        const score = insights?.systemHealth.score ?? 0;
        if (score >= 80) return { label: "Healthy", cls: "text-emerald-600 dark:text-emerald-300" };
        if (score >= 60) return { label: "Monitor", cls: "text-amber-600 dark:text-amber-300" };
        return { label: "At Risk", cls: "text-red-600 dark:text-red-300" };
    }, [insights]);

    const freshnessPct = useMemo(() => {
        if (!insights) return 0;
        const ratio = insights.market.pricedStocks
            ? (insights.market.freshStocks / insights.market.pricedStocks) * 100
            : 0;
        return Math.max(0, Math.min(100, Math.round(ratio)));
    }, [insights]);

    const maxTopAuthorPosts = useMemo(() => {
        if (!insights?.topAuthors?.length) return 1;
        return Math.max(1, ...insights.topAuthors.map((author) => author.posts));
    }, [insights]);

    const filteredPosts = useMemo(() => {
        return enrichedPosts.filter((post) => {
            const searchText = `${post.content} ${post.user?.firstName || ""} ${post.user?.lastName || ""} ${post.user?.handle || ""}`.toLowerCase();
            const matchesSearch = postSearch.trim().length === 0 || searchText.includes(postSearch.toLowerCase());
            const matchesRisk = riskFilter === "all" || post.risk === riskFilter;
            return matchesSearch && matchesRisk;
        });
    }, [enrichedPosts, postSearch, riskFilter]);

    const togglePostExpand = (postId: string) => {
        setExpandedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
    };

    const exportSnapshot = () => {
        const payload = {
            generatedAt: new Date().toISOString(),
            stats,
            insights,
            moderation: moderationMetrics,
            sampledPosts: enrichedPosts.slice(0, 20).map((post) => ({
                id: post.id,
                createdAt: post.createdAt,
                risk: post.risk,
                author: post.user?.handle,
                preview: (post.content || "").slice(0, 180),
            })),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `admin-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const metricCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            description: "Registered accounts",
            tint: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
        },
        {
            title: "Active Today",
            value: stats?.activeUsers || 0,
            icon: Activity,
            description: "Unique visitors today",
            tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        },
        {
            title: "Total Posts",
            value: stats?.totalPosts || 0,
            icon: FileText,
            description: "Content generated",
            tint: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
        },
        {
            title: "Stocks Tracked",
            value: stats?.totalStocks || 0,
            icon: TrendingUp,
            description: "Market entities",
            tint: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
        },
    ];

    if (isLoading || !user || user.role !== "ADMIN") {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-background to-slate-100/50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
                <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
                    <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">
                                <Clock3 className="h-3.5 w-3.5" />
                                {lastSyncedAt
                                    ? `Last synced ${formatDistanceToNow(lastSyncedAt, { addSuffix: true })}`
                                    : "Syncing admin data"}
                            </div>
                            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight md:text-4xl">
                                <ShieldAlert className="h-8 w-8 text-cyan-300" />
                                Admin Command Center
                            </h1>
                            <p className="mt-2 text-sm text-slate-200 md:text-base">
                                Monitor platform health, moderate content quickly, and keep system operations clean.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="secondary"
                                className="bg-white/10 text-white hover:bg-white/20"
                                onClick={refreshDashboard}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                Refresh Data
                            </Button>
                            <Button
                                variant="secondary"
                                className="bg-white/10 text-white hover:bg-white/20"
                                onClick={exportSnapshot}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Snapshot
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                                onClick={async () => {
                                    await logout();
                                    router.push("/login");
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {metricCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title} className="border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-xs uppercase tracking-wide">{card.title}</CardDescription>
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.tint}`}>
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-slate-200/70 bg-card/95">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wide">User Growth (7D)</CardDescription>
                            <CardTitle className="text-2xl">{insights?.growth.users7d ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {`${(insights?.growth.usersDeltaPct ?? 0) >= 0 ? "+" : ""}${insights?.growth.usersDeltaPct ?? 0}% vs previous week`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 bg-card/95">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wide">Posts Published (7D)</CardDescription>
                            <CardTitle className="text-2xl">{insights?.growth.posts7d ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {`${(insights?.growth.postsDeltaPct ?? 0) >= 0 ? "+" : ""}${insights?.growth.postsDeltaPct ?? 0}% vs previous week`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 bg-card/95">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wide">System Health</CardDescription>
                            <CardTitle className="text-2xl">{insights?.systemHealth.score ?? 0}%</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-xs font-medium ${healthTone.cls}`}>{healthTone.label}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 bg-card/95">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wide">Market Data Freshness</CardDescription>
                            <CardTitle className="text-2xl">{freshnessPct}%</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${freshnessPct}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1 md:grid-cols-5 dark:bg-slate-800/60">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="system">System Health</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="content">Content Moderation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest community posts with automatic risk scanning</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {enrichedPosts.slice(0, 6).map((post) => (
                                            <div key={post.id} className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                                        <img
                                                            src={post.user?.avatarUrl || "https://github.com/shadcn.png"}
                                                            alt="User avatar"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 space-y-1">
                                                        <p className="text-sm font-medium leading-none">
                                                            {post.user?.firstName || "Unknown"} {post.user?.lastName || "User"}
                                                        </p>
                                                        <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                                                        <Badge variant="outline" className={riskBadgeClasses[post.risk]}>
                                                            {post.risk === "safe" ? "Safe" : post.risk === "review" ? "Review" : "High Risk"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card className="border-slate-200/70 bg-card/95">
                                    <CardHeader>
                                        <CardTitle>Moderation Pulse</CardTitle>
                                        <CardDescription>Flagged queue and content quality mix</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { key: "high", label: "High Risk", count: moderationMetrics.high, pct: moderationMetrics.highPct },
                                            { key: "review", label: "Needs Review", count: moderationMetrics.review, pct: moderationMetrics.reviewPct },
                                            { key: "safe", label: "Safe", count: moderationMetrics.safe, pct: moderationMetrics.safePct },
                                        ].map((item) => {
                                            const level = item.key as RiskLevel;
                                            return (
                                                <div key={item.key} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`h-2 w-2 rounded-full ${riskDotClasses[level]}`} />
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            {item.count} ({item.pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-muted">
                                                        <div
                                                            className={`h-2 rounded-full ${riskDotClasses[level]}`}
                                                            style={{ width: item.pct === 0 ? "0%" : `${item.pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/70 bg-card/95">
                                    <CardHeader>
                                        <CardTitle>Ops Highlights</CardTitle>
                                        <CardDescription>Fast snapshot for your moderation round</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                            <span className="text-muted-foreground">Posts in last 24h</span>
                                            <span className="font-semibold">{moderationMetrics.postsToday}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                            <span className="text-muted-foreground">Avg post length</span>
                                            <span className="font-semibold">{moderationMetrics.averagePostLength} chars</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                            <span className="text-muted-foreground">Flagged queue</span>
                                            <span className="font-semibold">{moderationMetrics.high + moderationMetrics.review}</span>
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("content")}>
                                            Go To Moderation Queue
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>User & Activity Trend</CardTitle>
                                    <CardDescription>Daily new users vs active users for the last 7 days</CardDescription>
                                </CardHeader>
                                <CardContent className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={insights?.trends.dailyUsers || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                                                </linearGradient>
                                                <linearGradient id="newUsersGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                                            <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="activeUsers" stroke="#0ea5e9" fill="url(#activeUsersGradient)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="newUsers" stroke="#10b981" fill="url(#newUsersGradient)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>Top Contributors</CardTitle>
                                    <CardDescription>Authors with highest lifetime posting volume</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(insights?.topAuthors || []).map((author) => {
                                        const width = Math.max(8, Math.round((author.posts / maxTopAuthorPosts) * 100));
                                        return (
                                            <div key={author.handle} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <UserRound className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate font-medium">{author.name}</span>
                                                        <span className="truncate text-xs text-muted-foreground">@{author.handle}</span>
                                                    </div>
                                                    <span className="text-muted-foreground">{author.posts}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted">
                                                    <div className="h-2 rounded-full bg-sky-500" style={{ width: `${width}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>Activity Heatline (24H)</CardTitle>
                                    <CardDescription>Publishing intensity by hour</CardDescription>
                                </CardHeader>
                                <CardContent className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={insights?.trends.hourlyPosts || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                                            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                                            <Tooltip />
                                            <Bar dataKey="posts" radius={[4, 4, 0, 0]} fill="#6366f1" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>Market Overview</CardTitle>
                                    <CardDescription>Live feed coverage and movers snapshot</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                        <span className="text-muted-foreground">Stocks with price feed</span>
                                        <span className="font-semibold">{insights?.market.pricedStocks ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                        <span className="text-muted-foreground">Fresh updates (&lt;12h)</span>
                                        <span className="font-semibold">{insights?.market.freshStocks ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                        <span className="text-muted-foreground">Strong gainers (&gt;=2%)</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-300">{insights?.market.movers.gainers ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                                        <span className="text-muted-foreground">Strong losers (&lt;=-2%)</span>
                                        <span className="font-semibold text-red-600 dark:text-red-300">{insights?.market.movers.losers ?? 0}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>System Health Monitor</CardTitle>
                                    <CardDescription>Operational readiness and risk indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border bg-muted/40 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Overall health score</span>
                                            <span className={`text-sm font-semibold ${healthTone.cls}`}>{healthTone.label}</span>
                                        </div>
                                        <div className="text-3xl font-semibold">{insights?.systemHealth.score ?? 0}%</div>
                                        <div className="mt-3 h-2 w-full rounded-full bg-muted">
                                            <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${insights?.systemHealth.score ?? 0}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-cyan-500" />
                                                <span>Stale stock records</span>
                                            </div>
                                            <span className="font-semibold">{insights?.systemHealth.staleStocks ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                <span>High-risk moderation queue</span>
                                            </div>
                                            <span className="font-semibold">{insights?.systemHealth.highRiskQueue ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <ServerCog className="h-4 w-4 text-emerald-500" />
                                                <span>Data freshness coverage</span>
                                            </div>
                                            <span className="font-semibold">{freshnessPct}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/70 bg-card/95">
                                <CardHeader>
                                    <CardTitle>Recent High-Risk Queue</CardTitle>
                                    <CardDescription>Priority posts to review right now</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {enrichedPosts.filter((post) => post.risk === "high").slice(0, 5).map((post) => (
                                        <div key={post.id} className="rounded-md border border-red-200/50 bg-red-50/40 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                                            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                <span>@{post.user?.handle || "unknown"}</span>
                                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                            </div>
                                            <p className="line-clamp-3 text-sm">{post.content}</p>
                                        </div>
                                    ))}
                                    {enrichedPosts.filter((post) => post.risk === "high").length === 0 && (
                                        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No high-risk posts in the recent stream.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-200/70 bg-card/95">
                            <CardHeader>
                                <CardTitle>Ops Activity Log</CardTitle>
                                <CardDescription>Live moderation timeline based on recent posts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {enrichedPosts.slice(0, 8).map((post) => (
                                        <div key={post.id} className="flex items-start gap-3 rounded-md border px-3 py-2">
                                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${riskDotClasses[post.risk]}`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span>@{post.user?.handle || "unknown"}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                <p className="line-clamp-2 text-sm">{post.content}</p>
                                            </div>
                                            <Badge variant="outline" className={riskBadgeClasses[post.risk]}>
                                                {post.risk}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <Card className="border-slate-200/70 bg-card/95">
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
                        <Card className="border-slate-200/70 bg-card/95">
                            <CardHeader>
                                <CardTitle>Post Management</CardTitle>
                                <CardDescription>Search, triage, and remove inappropriate content quickly</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by content, name, or handle"
                                            value={postSearch}
                                            onChange={(e) => setPostSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1">
                                        <Button size="sm" variant={riskFilter === "all" ? "default" : "ghost"} onClick={() => setRiskFilter("all")}>
                                            All
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={riskFilter === "review" ? "default" : "ghost"}
                                            onClick={() => setRiskFilter("review")}
                                        >
                                            Review
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={riskFilter === "high" ? "destructive" : "ghost"}
                                            onClick={() => setRiskFilter("high")}
                                        >
                                            High Risk
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredPosts.length === 0 ? (
                                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            No posts match the selected filter.
                                        </div>
                                    ) : (
                                        filteredPosts.map((post) => {
                                            const isExpanded = expandedPosts.includes(post.id);
                                            const isLongContent = (post.content || "").length > 320;

                                            return (
                                                <div
                                                    key={post.id}
                                                    className={`rounded-xl border bg-card p-4 shadow-sm ${
                                                        post.risk === "high"
                                                            ? "border-red-300/70"
                                                            : post.risk === "review"
                                                                ? "border-amber-300/70"
                                                                : "border-slate-200/80"
                                                    }`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                                                            <img
                                                                src={post.user?.avatarUrl || "https://github.com/shadcn.png"}
                                                                alt="Post author"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                <span className="font-semibold">
                                                                    {post.user?.firstName || "Unknown"} {post.user?.lastName || "User"}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">@{post.user?.handle || "unknown"}</span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                                                </span>
                                                                <Badge variant="outline" className={riskBadgeClasses[post.risk]}>
                                                                    {post.risk === "safe" && <ShieldCheck className="mr-1 h-3 w-3" />}
                                                                    {post.risk === "review" && <Activity className="mr-1 h-3 w-3" />}
                                                                    {post.risk === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
                                                                    {post.risk === "safe" ? "Safe" : post.risk === "review" ? "Needs Review" : "High Risk"}
                                                                </Badge>
                                                            </div>

                                                            <p className={`whitespace-pre-line text-foreground ${!isExpanded ? "line-clamp-6" : ""}`}>
                                                                {post.content}
                                                            </p>

                                                            {isLongContent && (
                                                                <Button
                                                                    variant="link"
                                                                    className="h-auto px-0 py-1"
                                                                    onClick={() => togglePostExpand(post.id)}
                                                                >
                                                                    {isExpanded ? "Show less" : "Read full post"}
                                                                </Button>
                                                            )}

                                                            {post.imageUrl && (
                                                                <img
                                                                    src={post.imageUrl}
                                                                    alt="Post attachment"
                                                                    className="mt-2 h-36 rounded-md border object-cover"
                                                                />
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
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}