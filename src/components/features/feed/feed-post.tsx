"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Share2, TrendingUp, TrendingDown, Repeat2, MoreHorizontal, Link as LinkIcon, Facebook, Linkedin, Twitter, Bookmark, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StockBadge } from "@/components/shared/stock-badge";
import { DeveloperBadge } from "@/components/shared/developer-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Users, UserPlus } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { formatDistanceToNow } from "date-fns";
import { usePostInteraction, useUserInteraction } from "@/lib/store/interaction-store";

const formatContent = (content: string) => {
    if (!content) return null;

    // Split by newlines for better control over alignment
    const lines = content.split('\n');

    const parseText = (text: string) => {
        // Regex for Markdown links [Text](URL), Cashtags $SYMBOL, URLs, and Bold **text**
        const parts = text.split(/(\[.*?\]\(https?:\/\/[^\s\)]+\)|\$[A-Za-z0-9]+|https?:\/\/[^\s]+|\*\*.*?\*\*)/g);

        return parts.map((part, i) => {
            // Match Markdown Link: [Text](URL)
            const mdMatch = part.match(/\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/);
            if (mdMatch) {
                return (
                    <a key={i} href={mdMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline">
                        {mdMatch[1]}
                    </a>
                );
            }

            // Bold: **text**
            const boldMatch = part.match(/\*\*(.*?)\*\*/);
            if (boldMatch) {
                return <strong key={i} className="font-bold text-foreground">{boldMatch[1]}</strong>;
            }

            // Cashtags: $SYMBOL
            if (part.startsWith('$')) {
                const symbol = part.substring(1).toUpperCase();
                return (
                    <Link key={i} href={`/stock/${symbol}`} className="font-extrabold text-blue-600 hover:underline">
                        {part}
                    </Link>
                );
            }

            // Raw URL
            if (part.startsWith('http')) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                        {part}
                    </a>
                );
            }

            return part;
        });
    };

    return lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
            // Only add height for truly empty lines, not just spaces
            return line === "" ? <div key={idx} className="h-3" /> : null;
        }

        // Handle Bullet Points (e.g., •, -, *)
        const bulletMatch = line.match(/^(\s*)([•\-\*])(\s+)(.*)/);
        if (bulletMatch) {
            return (
                <div key={idx} className="flex gap-2.5 items-start mb-1.5 group">
                    <span className="flex-shrink-0 text-muted-foreground/80 mt-[3px] scale-125">•</span>
                    <p className="flex-1 leading-relaxed text-foreground/90 text-justify [text-justify:inter-word]">
                        {parseText(bulletMatch[4])}
                    </p>
                </div>
            );
        }

        // Handle lines that start with bullet but no space after (common in raw data)
        const simpleBulletMatch = line.match(/^(\s*)([•\-\*])(.*)/);
        if (simpleBulletMatch) {
            return (
                <div key={idx} className="flex gap-2.5 items-start mb-1.5 group">
                    <span className="flex-shrink-0 text-muted-foreground/80 mt-[3px] scale-125">•</span>
                    <p className="flex-1 leading-relaxed text-foreground/90 text-justify [text-justify:inter-word]">
                        {parseText(simpleBulletMatch[3])}
                    </p>
                </div>
            );
        }

        return (
            <p key={idx} className="mb-2 leading-relaxed text-foreground/95 text-justify [text-justify:inter-word]">
                {parseText(line)}
            </p>
        );
    });
};

export function FeedPost({ post }: { post: any }) {
    const { user: currentUser, setShowLoginModal } = useAuth();
    const isReshare = !!post.originalPost;
    const displayPost = isReshare ? post.originalPost : post;
    const isQuoteRepost = isReshare && post.content && post.content.trim() !== '';
    // For quote reposts, show the quoting user as the main author
    const headerUser = isQuoteRepost ? post.user : displayPost.user;

    // --- Global Store Hooks ---
    // User Interaction (Follow/Block)
    const { isFollowing, isBlocked, toggleFollow, toggleBlock } = useUserInteraction(
        displayPost.user?.id || "unknown",
        { isFollowing: displayPost.isFollowingAuthor }
    );

    // Post Interaction (Like/Bookmark/Reshare)
    const {
        isLiked,
        likeCount,
        isBookmarked,
        isReshared,
        reshareCount,
        toggleLike,
        toggleBookmark,
        toggleReshare,
        quoteRepost
    } = usePostInteraction(post.id, {
        isLiked: post.likedByMe,
        likeCount: post.likeCount,
        isBookmarked: post.bookmarkedByMe,
        isReshared: post.resharedByMe,
        reshareCount: post.reshareCount
    });

    const [commentsCount, setCommentsCount] = React.useState(post._count?.comments || post.comments?.length || 0);

    // UI Local State
    const [showComments, setShowComments] = React.useState(false);
    const [comments, setComments] = React.useState<any[]>([]);
    const [newComment, setNewComment] = React.useState("");
    const [isLoadingComments, setIsLoadingComments] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    // Edit/Delete State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editContent, setEditContent] = React.useState(post.content);
    const [isDeleted, setIsDeleted] = React.useState(false);
    const [hasReported, setHasReported] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [showQuoteModal, setShowQuoteModal] = React.useState(false);
    const [quoteContent, setQuoteContent] = React.useState("");
    const CONTENT_LIMIT = 280;

    // Haptic Helper
    const vibrate = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Light tap
        }
    };

    // --- Handlers (Proxies to Store) ---

    // Follow Handler
    const handleFollow = async () => {
        vibrate();
        if (!currentUser) return setShowLoginModal(true);
        if (displayPost.user?.id) {
            await toggleFollow();
        }
    };

    // Like Handler
    const handleLike = async () => {
        vibrate();
        if (!currentUser) return setShowLoginModal(true);
        await toggleLike();
    };

    // Bookmark Handler
    const handleBookmark = async () => {
        vibrate();
        if (!currentUser) return setShowLoginModal(true);
        await toggleBookmark();
    };

    // Reshare Handler (simple toggle)
    const handleReshare = async () => {
        vibrate();
        if (!currentUser) return setShowLoginModal(true);
        // If undoing, dispatch event so feed can remove the reshare post
        if (isReshared) {
            window.dispatchEvent(new CustomEvent('repost-undone', { detail: { postId: post.id } }));
        }
        await toggleReshare();
    };

    // Quote Repost Handler
    const handleQuoteRepost = async () => {
        if (!quoteContent.trim()) return;
        vibrate();
        const content = quoteContent;
        // Close modal immediately for snappy UX
        setQuoteContent("");
        setShowQuoteModal(false);
        // Fire-and-forget the API call — don't block the UI
        quoteRepost(content).then(() => {
            // Dispatch event so the feed page can refresh
            window.dispatchEvent(new CustomEvent('quote-repost-created'));
        });
    };

    // Block Handler
    const handleBlock = async () => {
        if (!currentUser) return setShowLoginModal(true);
        if (confirm(`Block @${displayPost.user?.handle}?`)) {
            await toggleBlock();
            setIsDeleted(true); // Hide locally
        }
    };

    // Social & Other Handlers (Kept Local)
    const handleSocialShare = (platform: string) => {
        const postUrl = `${window.location.origin}/post/${post.id}`;
        const text = `Check out this post on StocksX: ${post.content?.substring(0, 50)}...`;
        let url = '';

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(postUrl);
                alert("Link copied to clipboard!");

                // Track backend share
                const token = localStorage.getItem('accessToken');
                if (token) {
                    fetch(`${API_BASE_URL}/posts/${post.id}/share`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(() => { });
                }
                return;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
            const token = localStorage.getItem('accessToken');
            if (token) {
                fetch(`${API_BASE_URL}/posts/${post.id}/share`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => { });
            }
        }
    }

    const toggleComments = async () => {
        if (!showComments) {
            setShowComments(true);
            if (comments.length === 0) {
                setIsLoadingComments(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/posts/${post.id}/comments`);
                    if (res.ok) {
                        const data = await res.json();
                        setComments(data);
                    }
                } catch (e) {
                    console.error("Failed to load comments");
                } finally {
                    setIsLoadingComments(false);
                }
            }
        } else {
            setShowComments(false);
        }
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return setShowLoginModal(true);

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([...comments, comment]);
                setCommentsCount(commentsCount + 1);
                setNewComment("");
            }
        } catch (e) {
            console.error("Failed to post comment");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsDeleted(true);
        } catch (e) {
            console.error("Failed to delete post", e);
        }
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent })
            });
            if (res.ok) {
                setIsEditing(false);
                post.content = editContent; // Optimistic update of prop object for display
            }
        } catch (e) {
            console.error("Failed to update post", e);
        }
    };

    const handleReport = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return setShowLoginModal(true);

        if (confirm("Report this post?")) {
            try {
                await fetch(`${API_BASE_URL}/posts/${post.id}/report`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsDeleted(true);
                setHasReported(true);
            } catch (e) { console.error(e); }
        }
    };

    // If global block state says blocked, hide the post
    if (isDeleted || (isBlocked && currentUser?.id !== displayPost.user?.id)) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="md:mb-4 last:mb-20"
            >
                {/* Simple repost header (not for quote reposts) */}
                {isReshare && !isQuoteRepost && (
                    <div className="flex items-center gap-2 mb-1 px-3 pl-[56px] md:px-0 md:pl-4 text-muted-foreground text-xs md:text-sm font-medium">
                        <Repeat2 size={14} className="flex-shrink-0" />
                        <Link href={`/u/${post.user?.handle}`} className="hover:underline truncate">
                            {post.user?.name || post.user?.handle} reposted
                        </Link>
                    </div>
                )}
                <Card className="flex flex-row md:block border-x-0 border-t-0 border-b border-border shadow-none md:shadow-sm md:border-x md:border-t hover:border-primary/20 transition-colors bg-background md:bg-card relative rounded-none md:rounded-xl px-3 py-3 md:p-0 gap-3 md:gap-0 w-full">

                    {/* Mobile-only Left Column Avatar */}
                    <div className="md:hidden flex-shrink-0 pt-0.5">
                        <Link href={`/u/${headerUser?.handle}`} className="block h-10 w-10 rounded-full bg-muted overflow-hidden hover:opacity-80 transition-opacity">
                            <img src={headerUser?.avatarUrl || "https://github.com/shadcn.png"} alt={headerUser?.handle} className="h-full w-full object-cover" />
                        </Link>
                    </div>

                    {/* Desktop Absolute Menu */}
                    <div className="absolute top-4 right-4 z-10 hidden md:flex flex-col items-center gap-2">
                        <AnimatePresence>
                            {currentUser && displayPost.user && currentUser.handle !== displayPost.user.handle && !isFollowing && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-95 transition-all"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleFollow();
                                        }}
                                    >
                                        Follow
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-colors">
                                    <MoreHorizontal size={16} className="text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {currentUser && displayPost.user && currentUser.id === displayPost.user.id ? (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit Post</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">Delete Post</DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={handleReport}>Report Post</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleBlock}>Block User</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Main Content Column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <CardHeader className="flex flex-row items-start space-y-0 p-0 md:p-6 md:pb-3 md:pt-5 gap-0 md:gap-3 pr-0 md:pr-12">
                            {/* Desktop Avatar */}
                            <Link href={`/u/${headerUser?.handle}`} className="hidden md:block h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                                <img src={headerUser?.avatarUrl || "https://github.com/shadcn.png"} alt={headerUser?.handle} className="h-full w-full object-cover" />
                            </Link>

                            {/* Header Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-wrap items-center gap-x-1.5 md:gap-x-2 gap-y-0.5">
                                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                                            <div className="flex items-center gap-0.5 md:gap-1">
                                                <Link href={`/u/${headerUser?.handle}`} className="font-bold text-[14px] md:font-semibold md:text-base text-foreground truncate hover:underline">
                                                    {headerUser?.name || headerUser?.firstName}
                                                </Link>
                                                {(headerUser?.isVerified || headerUser?.verified) && (
                                                    <VerifiedBadge user={headerUser} />
                                                )}
                                                <DeveloperBadge user={headerUser} />
                                            </div>

                                            <div className="flex items-center gap-1 text-[13px] md:text-sm text-muted-foreground min-w-0">
                                                <Link href={`/u/${headerUser?.handle}`} className="hover:underline truncate text-ellipsis overflow-hidden">@{headerUser?.handle}</Link>
                                                <span className="flex-shrink-0">·</span>
                                                <span className="whitespace-nowrap flex-shrink-0 hover:underline cursor-pointer">
                                                    {formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Menu */}
                                    <div className="flex items-center gap-2 md:hidden -mt-1 -mr-1">
                                        <AnimatePresence>
                                            {currentUser && displayPost.user && currentUser.handle !== displayPost.user.handle && !isFollowing && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2.5 text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-sm active:scale-95 transition-all"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleFollow();
                                                        }}
                                                    >
                                                        Follow
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                {currentUser && displayPost.user && currentUser.id === displayPost.user.id ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit Post</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">Delete Post</DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={handleReport}>Report Post</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleBlock}>Block User</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Sentiment Badge */}
                                {displayPost.sentiment && (
                                    <div className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider mt-0.5 inline-flex items-center gap-1",
                                        displayPost.sentiment === "BULLISH" ? "text-green-600" : "text-red-600"
                                    )}>
                                        {displayPost.sentiment === "BULLISH" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {displayPost.sentiment}
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 md:px-6 md:pb-3 pt-1 md:pt-0 text-[14px] md:text-base text-foreground leading-snug md:leading-relaxed">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full min-h-[100px] p-3 rounded-md bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleUpdate}>Save</Button>
                                    </div>
                                </div>
                            ) : isQuoteRepost ? (
                                /* --- Quote Repost: User's commentary + embedded original post --- */
                                <div>
                                    {/* Quoting user's commentary */}
                                    <div className="text-[14px] md:text-base text-foreground leading-normal md:leading-relaxed pb-3 break-words">
                                        {formatContent(post.content)}
                                    </div>

                                    {/* Embedded Original Post Card */}
                                    <div className="rounded-xl border border-border/60 overflow-hidden hover:bg-muted/10 transition-colors cursor-pointer">
                                        {/* Original Post Header */}
                                        <div className="p-3 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/u/${displayPost.user?.handle}`} className="h-5 w-5 rounded-full bg-muted overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                                                    <img src={displayPost.user?.avatarUrl || "https://github.com/shadcn.png"} alt={displayPost.user?.handle} className="h-full w-full object-cover" />
                                                </Link>
                                                <Link href={`/u/${displayPost.user?.handle}`} className="text-sm font-semibold text-foreground hover:underline leading-tight truncate">
                                                    {displayPost.user?.name || displayPost.user?.firstName}
                                                </Link>
                                                {(displayPost.user?.isVerified || displayPost.user?.verified) && (
                                                    <VerifiedBadge user={displayPost.user} />
                                                )}
                                                <span className="text-xs text-muted-foreground truncate">@{displayPost.user?.handle}</span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">·</span>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                    {formatDistanceToNow(new Date(displayPost.createdAt || Date.now()), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Original Post Content */}
                                        <div className="px-3 pb-3">
                                            <div className="text-sm text-foreground/85 leading-relaxed line-clamp-4 break-words">
                                                {formatContent(displayPost.content)}
                                            </div>
                                        </div>

                                        {/* Original Post Image */}
                                        {displayPost.imageUrl && !imageError && (
                                            <div className="border-t border-border/40">
                                                <img
                                                    src={displayPost.imageUrl.startsWith('http') ? displayPost.imageUrl : `${API_BASE_URL}${displayPost.imageUrl}`}
                                                    alt="Post content"
                                                    className="w-full max-h-64 object-cover"
                                                    onError={() => setImageError(true)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* --- Normal post / Simple repost content --- */
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            height: isExpanded ? "auto" : (displayPost.content?.length > CONTENT_LIMIT ? 140 : "auto")
                                        }}
                                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        className="relative overflow-hidden"
                                    >
                                        <div className="text-[14px] md:text-base text-foreground leading-normal md:leading-relaxed pb-1 break-words">
                                            {formatContent(displayPost.content)}
                                        </div>

                                        {/* Gradient Fade for collapsed long content */}
                                        <AnimatePresence>
                                            {!isExpanded && displayPost.content?.length > CONTENT_LIMIT && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background md:from-card via-background/80 md:via-card/80 to-transparent pointer-events-none z-10"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {displayPost.content?.length > CONTENT_LIMIT && (
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="text-primary font-bold text-sm mt-1 hover:text-primary/80 transition-colors focus:outline-none relative z-20"
                                        >
                                            {isExpanded ? "Show less" : "Show more"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Image (only for non-quote reposts, since quote shows it in the embedded card) */}
                            {!isQuoteRepost && displayPost.imageUrl && !imageError && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-border max-h-[512px] flex items-center justify-center bg-muted/50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={displayPost.imageUrl.startsWith('http') ? displayPost.imageUrl : `${API_BASE_URL}${displayPost.imageUrl}`}
                                        alt="Post content"
                                        className="w-full h-full object-contain"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            )}

                            {/* Tags */}
                            {displayPost.tags && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {displayPost.tags.map((tag: any) => (
                                        <StockBadge key={tag.symbol} symbol={tag.symbol} change={tag.change} />
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="p-0 pt-3 md:px-6 md:pt-2 md:pb-4 flex-col items-stretch">
                            <div className="flex justify-between w-full text-muted-foreground md:max-w-md">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 md:gap-2 group hover:text-blue-500 px-0 md:px-3"
                                    onClick={toggleComments}
                                >
                                    <MessageSquare size={18} className="group-hover:stroke-blue-500" />
                                    <span>{commentsCount}</span>
                                </Button>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            className={cn("gap-1.5 md:gap-2 group flex items-center pr-2 md:px-2 py-1 rounded-full transition-colors", isReshared ? "text-green-500 bg-green-500/10 md:bg-transparent" : "text-muted-foreground hover:text-green-500 hover:bg-green-500/5")}
                                        >
                                            <motion.div
                                                animate={isReshared ? { rotate: 180, scale: 1.1 } : { rotate: 0, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                            >
                                                <Repeat2 size={18} className={cn("transition-colors", isReshared ? "text-green-500 stroke-[2.5px]" : "group-hover:stroke-green-500")} />
                                            </motion.div>
                                            <span className={cn("text-sm transition-colors", isReshared && "text-green-500 font-medium")}>{reshareCount}</span>
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        <DropdownMenuItem onClick={handleReshare} className="cursor-pointer">
                                            <Repeat2 className="mr-2 h-4 w-4" />
                                            <span>{isReshared ? 'Undo Repost' : 'Repost'}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { if (!currentUser) return setShowLoginModal(true); setShowQuoteModal(true); }} className="cursor-pointer">
                                            <Quote className="mr-2 h-4 w-4" />
                                            <span>Quote Repost</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>


                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    className={cn("flex items-center gap-1 md:gap-1.5 group transition-colors rounded-full pr-2 md:px-2 py-1", isLiked ? "text-red-500 bg-red-500/10 md:bg-transparent" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5")}
                                    onClick={handleLike}
                                >
                                    <div className="relative">
                                        <Heart size={16} className={cn("md:w-[18px] md:h-[18px] transition-all", isLiked && "fill-current stroke-none scale-110")} />
                                        {isLiked && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 1 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 bg-red-500 rounded-full -z-10"
                                            />
                                        )}
                                    </div>
                                    <span className="text-xs md:text-sm font-medium">{likeCount}</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    className={cn("flex items-center gap-2 group transition-colors rounded-full px-0 md:px-2 py-1", isBookmarked ? "text-primary bg-primary/10 md:bg-transparent" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}
                                    onClick={handleBookmark}
                                >
                                    <Bookmark size={18} className={cn("transition-all", isBookmarked && "fill-current stroke-none scale-110")} />
                                </motion.button>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button whileTap={{ scale: 0.9 }} className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 px-0 md:px-2 py-1 rounded-full hover:bg-blue-500/5 transition-colors">
                                            <Share2 size={18} />
                                        </motion.button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground">
                                        <DropdownMenuItem onClick={() => handleSocialShare('copy')} className="cursor-pointer">
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            <span>Copy Link</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')} className="cursor-pointer">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>WhatsApp</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSocialShare('facebook')} className="cursor-pointer">
                                            <Facebook className="mr-2 h-4 w-4" />
                                            <span>Facebook</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSocialShare('twitter')} className="cursor-pointer">
                                            <Twitter className="mr-2 h-4 w-4" />
                                            <span>Twitter</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSocialShare('linkedin')} className="cursor-pointer">
                                            <Linkedin className="mr-2 h-4 w-4" />
                                            <span>LinkedIn</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Comments Section */}
                            {showComments && (
                                <div className="mt-3 md:mt-4 w-full border-t border-border pt-3 md:pt-4">
                                    <div className="space-y-4 mb-4">
                                        {isLoadingComments ? (
                                            <p className="text-sm text-muted-foreground text-center">Loading comments...</p>
                                        ) : comments.length > 0 ? (
                                            comments.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <Link href={`/u/${comment.user?.handle}`} className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                                                        <img src={comment.user?.avatarUrl || "https://github.com/shadcn.png"} alt={comment.user?.handle} className="h-full w-full object-cover" />
                                                    </Link>
                                                    <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center">
                                                                <Link href={`/u/${comment.user?.handle}`} className="font-semibold text-sm hover:underline">
                                                                    {comment.user?.name || comment.user?.firstName}
                                                                </Link>
                                                                {(comment.user?.isVerified || comment.user?.verified) && (
                                                                    <VerifiedBadge className="ml-1" user={comment.user} />
                                                                )}
                                                                <DeveloperBadge user={comment.user} className="ml-1" />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center italic">No comments yet.</p>
                                        )}
                                    </div>

                                    <form onSubmit={submitComment} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <Button type="submit" size="sm" disabled={!newComment.trim()} className="rounded-full">
                                            Post
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardFooter>
                    </div>
                </Card>
            </motion.div>

            {/* Quote Repost Modal */}
            {showQuoteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowQuoteModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Quote className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="font-bold text-foreground text-lg">Quote Repost</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setShowQuoteModal(false)}>
                                ✕
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            {/* User Avatar + Textarea */}
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                                    <img src={currentUser?.avatarUrl || "https://github.com/shadcn.png"} alt="You" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={quoteContent}
                                        onChange={(e) => setQuoteContent(e.target.value)}
                                        placeholder="Share your thoughts on this post..."
                                        className="w-full min-h-[80px] bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none text-[15px] leading-relaxed"
                                        autoFocus
                                        maxLength={500}
                                    />
                                    {/* Character counter */}
                                    <div className="flex justify-end mt-1">
                                        <span className={cn("text-xs transition-colors", quoteContent.length > 450 ? "text-orange-500" : quoteContent.length > 480 ? "text-red-500" : "text-muted-foreground/50")}>
                                            {quoteContent.length}/500
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Original Post Preview Card */}
                            <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="p-4">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                            <img src={displayPost.user?.avatarUrl || "https://github.com/shadcn.png"} alt={displayPost.user?.handle} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground leading-tight">{displayPost.user?.name || displayPost.user?.firstName}</span>
                                            <span className="text-xs text-muted-foreground">@{displayPost.user?.handle}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{displayPost.content}</p>
                                    {displayPost.imageUrl && (
                                        <div className="mt-2.5 rounded-lg overflow-hidden border border-border/40 max-h-32">
                                            <img src={displayPost.imageUrl.startsWith('http') ? displayPost.imageUrl : `${API_BASE_URL}${displayPost.imageUrl}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between bg-gradient-to-r from-transparent to-primary/5">
                            <span className="text-xs text-muted-foreground">Your quote will appear in the feed</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowQuoteModal(false)} className="rounded-full px-4 text-muted-foreground hover:text-foreground">Cancel</Button>
                                <Button
                                    size="sm"
                                    disabled={!quoteContent.trim()}
                                    onClick={handleQuoteRepost}
                                    className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
                                >
                                    <Repeat2 className="h-4 w-4 mr-1.5" />
                                    Post Quote
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
