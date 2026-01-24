"use client";

import React from "react";
import { MessageSquare, Heart, Share2, TrendingUp, TrendingDown, Repeat2, MoreHorizontal, Link as LinkIcon, Facebook, Linkedin, Twitter, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StockBadge } from "@/components/shared/stock-badge";
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

const formatContent = (content: string) => {
    if (!content) return null;

    // Split by cashtags ($SYMBOL) and URLs
    const parts = content.split(/(\$[A-Za-z0-9]+|https?:\/\/[^\s]+)/g);

    return parts.map((part, i) => {
        if (part.startsWith('$')) {
            const symbol = part.substring(1).toUpperCase();
            return (
                <Link
                    key={i}
                    href={`/stock/${symbol}`}
                    className="font-bold text-blue-600 hover:underline"
                >
                    {part}
                </Link>
            );
        }
        if (part.startsWith('http')) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export function FeedPost({ post }: { post: any }) {
    const { user: currentUser, setShowLoginModal } = useAuth();
    const isReshare = !!post.originalPost;
    const displayPost = isReshare ? post.originalPost : post;

    const [likes, setLikes] = React.useState(post.likeCount || 0);
    const [isLiked, setIsLiked] = React.useState(post.likedByMe || false);
    const [isBookmarked, setIsBookmarked] = React.useState(post.bookmarkedByMe || false);
    const [commentsCount, setCommentsCount] = React.useState(post._count?.comments || post.comments?.length || 0);
    const [reshareCount, setReshareCount] = React.useState(post.reshareCount || 0);
    const [isFollowing, setIsFollowing] = React.useState(displayPost.isFollowingAuthor || false);
    const [followLoading, setFollowLoading] = React.useState(false);

    const [showComments, setShowComments] = React.useState(false);
    const [comments, setComments] = React.useState<any[]>([]);
    const [newComment, setNewComment] = React.useState("");
    const [isLoadingComments, setIsLoadingComments] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    // Edit/Delete State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editContent, setEditContent] = React.useState(post.content);
    const [hasReported, setHasReported] = React.useState(false); // Client-side temp hide
    const [isDeleted, setIsDeleted] = React.useState(false); // Client-side temp hide

    if (isDeleted) return null; // Hide post if deleted/blocked/reported

    // Update local state if prop changes (e.g. from a parent refresh)
    // Update local state if prop changes (e.g. from a parent refresh)
    React.useEffect(() => {
        setLikes(post.likeCount || 0);
        setIsLiked(post.likedByMe || false);
        setCommentsCount(post._count?.comments || post.comments?.length || 0);
        setReshareCount(post.reshareCount || 0);

        // Handle reshares correctly: check the displayed user's follow status

        // If it's a reshare, we need isFollowingAuthor from the original post (which we need to ensure backend sends)
        // Fallback: If backend sends isFollowingAuthor on root, we use it for root. 
        // Logic: specific prop for displayPost?
        // For now, let's assume displayPost has the prop if backend is updated.
        setIsFollowing(displayPost.isFollowingAuthor || false);
    }, [post.likeCount, post.likedByMe, post._count, post.comments, post.reshareCount, post.isFollowingAuthor, post.originalPost]);

    const handleFollow = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token || !displayPost.user) return;

        setFollowLoading(true);
        // Optimistic update
        const prevIsFollowing = isFollowing;
        setIsFollowing(!isFollowing);

        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const res = await fetch(`${API_BASE_URL}/users/${displayPost.user.id}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to toggle follow');
        } catch (e) {
            setIsFollowing(prevIsFollowing);
            console.error(e);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        // Optimistic update
        const prevLikes = likes;
        const prevIsLiked = isLiked;

        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to like/unlike');
        } catch (e) {
            // Revert on error
            setIsLiked(prevIsLiked);
            setLikes(prevLikes);
            console.error(e);
        }
    };

    const handleReshare = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        // Optimistic update
        setReshareCount(reshareCount + 1);

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}/reshare`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to reshare');
        } catch (e) {
            setReshareCount(reshareCount); // Revert
            console.error(e);
        }
    };

    const handleSocialShare = (platform: string) => {
        const postUrl = `${window.location.origin}/post/${post.id}`;
        const text = `Check out this post on StockX: ${post.content?.substring(0, 50)}...`;
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
            // Track backend share
            const token = localStorage.getItem('accessToken');
            if (token) {
                fetch(`${API_BASE_URL}/posts/${post.id}/share`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => { });
            }
        }
    }
    const handleBookmark = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        // Optimistic update
        const prevIsBookmarked = isBookmarked;
        setIsBookmarked(!isBookmarked);

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to bookmark');
        } catch (e) {
            setIsBookmarked(prevIsBookmarked); // Revert
        }
    };

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
        if (!token) {
            setShowLoginModal(true);
            return;
        }

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

    // --- Action Handlers ---

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setIsDeleted(true);
            }
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
                post.content = editContent; // Mutate prop or reload? Mutating for instant feedback
            }
        } catch (e) {
            console.error("Failed to update post", e);
        }
    };

    const handleReport = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        if (!confirm("Report this post? It will be hidden from your feed.")) return;

        try {
            await fetch(`${API_BASE_URL}/posts/${post.id}/report`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsDeleted(true); // Hide it immediately
            setHasReported(true);
        } catch (e) {
            console.error("Failed to report", e);
        }
    };

    const handleBlock = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        if (!confirm(`Block @${displayPost.user?.handle}? You will no longer see their posts.`)) return;

        try {
            await fetch(`${API_BASE_URL}/users/${displayPost.user?.id}/block`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsDeleted(true); // Hide this post immediately
            alert(`Blocked @${displayPost.user?.handle}`);
            window.location.reload(); // Reload to filter out all their posts? Or just hide this one
        } catch (e) {
            console.error("Failed to block", e);
        }
    };



    return (
        <div className="mb-4">
            {isReshare && (
                <div className="flex items-center gap-2 mb-1 ml-4 text-muted-foreground text-sm">
                    <Repeat2 size={14} />
                    <Link href={`/u/${post.user?.handle}`} className="hover:underline">
                        {post.user?.name || post.user?.handle} reposted
                    </Link>
                </div>
            )}
            <Card className="border-border shadow-sm hover:border-primary/20 transition-colors bg-card relative">
                <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
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

                <CardHeader className="flex flex-row items-start space-y-0 pb-3 pt-5 gap-3 pr-12">
                    {/* Avatar */}
                    <Link href={`/u/${displayPost.user?.handle}`} className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                        <img src={displayPost.user?.avatarUrl || "https://github.com/shadcn.png"} alt={displayPost.user?.handle} className="h-full w-full object-cover" />
                    </Link>

                    {/* Header Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <div className="flex items-center gap-1">
                                <Link href={`/u/${displayPost.user?.handle}`} className="font-semibold text-foreground truncate hover:underline">
                                    {displayPost.user?.name || displayPost.user?.firstName}
                                </Link>
                                {displayPost.user?.verified && (
                                    <span className="text-blue-500" title="Verified">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.748 2.795 1.867 3.61-.593 1.374-.153 2.973 1.054 3.738C5.232 20.35 6.136 20.5 7 20.5c.983 0 1.93-.19 2.802-.516.48.064.974.14 1.488.166.38.643.904 1.15 1.517 1.44.825.388 1.745.388 2.57 0 .613-.29 1.14-.796 1.517-1.44 2.198-.113 4.093-1.638 4.608-3.805 1.12-.815 1.868-2.153 1.868-3.61zM12 16.5c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5 5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" /></svg>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link href={`/u/${displayPost.user?.handle}`} className="hover:underline">@{displayPost.user?.handle}</Link>
                                <span>· {new Date(displayPost.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>

                            {/* Follow Button */}
                            {currentUser && displayPost.user && currentUser.handle !== displayPost.user.handle && !isFollowing && (
                                <div className="sm:ml-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full border border-blue-200"
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                    >
                                        {followLoading ? "..." : (
                                            <>
                                                <UserPlus size={12} className="mr-1" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
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

                <CardContent className="pb-3 text-[15px] md:text-base text-foreground whitespace-pre-line leading-normal md:leading-relaxed">
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
                    ) : (
                        formatContent(displayPost.content)
                    )}

                    {displayPost.imageUrl && !imageError && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-border max-h-[512px] flex items-center justify-center bg-muted/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={displayPost.imageUrl}
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

                <CardFooter className="pt-2 pb-4 flex-col items-stretch">
                    <div className="flex justify-between w-full text-muted-foreground max-w-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 group hover:text-blue-500"
                            onClick={toggleComments}
                        >
                            <MessageSquare size={18} className="group-hover:stroke-blue-500" />
                            <span>{commentsCount}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 group hover:text-green-500"
                            onClick={handleReshare}
                        >
                            <Repeat2 size={18} className="group-hover:stroke-green-500" />
                            <span>{reshareCount}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("gap-2 group", isLiked ? "text-red-500" : "hover:text-red-500")}
                            onClick={handleLike}
                        >
                            <Heart size={18} className={cn("group-hover:stroke-red-500", isLiked && "fill-current stroke-none")} />
                            <span>{likes}</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-500">
                                    <Share2 size={18} />
                                </Button>
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

                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("gap-2 group", isBookmarked ? "text-primary" : "hover:text-primary")}
                            onClick={handleBookmark}
                        >
                            <Bookmark size={18} className={cn("group-hover:stroke-primary", isBookmarked && "fill-current stroke-none")} />
                        </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-4 w-full border-t border-border pt-4">
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
                                                    <Link href={`/u/${comment.user?.handle}`} className="font-semibold text-sm hover:underline">
                                                        {comment.user?.name || comment.user?.firstName}
                                                    </Link>
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
            </Card>
        </div>
    );
}
