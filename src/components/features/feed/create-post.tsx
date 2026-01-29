"use client";

import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Image as ImageIcon, X, Smile, BarChart2, FileText, Gift, Send } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CreatePostProps {
    onPostCreated?: () => void;
    onOptimisticAdd?: (post: any) => void;
    onPostSuccess?: (tempId: string, realPost: any) => void;
    onPostError?: (tempId: string) => void;
}

export function CreatePost({ onPostCreated, onOptimisticAdd, onPostSuccess, onPostError }: CreatePostProps) {
    const { user, isLoading } = useAuth();
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [content]);

    if (!user || isLoading) return null;

    const addEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmojis(false);
    };

    async function handlePost() {
        if (!content.trim() && !imageUrl) return;

        // --- Optimistic UI Object ---
        const tempId = `temp-${Date.now()}`;
        const tempPost = {
            id: tempId,
            content,
            imageUrl,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            user: {
                id: user?.id,
                firstName: user?.firstName,
                handle: user?.handle,
                avatarUrl: user?.avatarUrl,
            },
            isOptimistic: true,
        };

        // 1. Optimistic Update
        if (onOptimisticAdd) onOptimisticAdd(tempPost);

        // 2. Clear Form immediately
        const keptContent = content;
        const keptImage = imageUrl;
        setContent("");
        setImageUrl(null);
        setIsPosting(true);
        setIsFocused(false);

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: keptContent, imageUrl: keptImage }),
            });

            if (res.ok) {
                const realPost = await res.json();
                if (onPostSuccess) onPostSuccess(tempId, realPost);
                if (onPostCreated) onPostCreated();
            } else {
                throw new Error("Failed to post");
            }
        } catch (error) {
            console.error("Error posting", error);
            // Revert
            if (onPostError) onPostError(tempId);
            // Restore form
            setContent(keptContent);
            setImageUrl(keptImage);
        } finally {
            setIsPosting(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/posts/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
            } else if (res.status === 401) {
                alert("Session expired. Please log in again.");
            } else {
                console.error("Failed to upload image", res.statusText);
            }
        } catch (error) {
            console.error("Error uploading image", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFeatureNotImplemented = (feature: string) => {
        alert(`${feature} feature coming soon!`);
    };

    const isExpanded = isFocused || content.length > 0 || imageUrl;

    return (
        <div className="relative mb-10 group z-20">
            {/* Glow / Separation Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

            <motion.div
                layout
                className={cn(
                    "relative bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg rounded-2xl overflow-hidden transition-all duration-300",
                    isExpanded ? "ring-2 ring-primary/10 shadow-xl" : "hover:border-primary/30"
                )}
            >
                {/* Header / Tabs visual */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-muted/20">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground ml-2 uppercase tracking-wider">
                        New Post
                    </span>
                    <div className="flex-1" />
                    {isPosting && <span className="text-xs text-primary animate-pulse">Posting...</span>}
                </div>

                <div className="p-5 flex gap-4">
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm shrink-0 mt-1">
                        <AvatarImage src={user.avatarUrl} alt={user.firstName || user.handle} />
                        <AvatarFallback>{(user.firstName?.[0] || user.handle[0]).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => !content && !imageUrl && setIsFocused(false)}
                                placeholder="Share your market insights, analysis, or questions..."
                                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus:bg-transparent p-0 text-foreground placeholder:text-muted-foreground/50 text-base md:text-lg resize-none min-h-[60px] max-h-[400px] leading-relaxed font-medium"
                                style={{ overflow: "hidden", backgroundColor: "transparent" }}
                            />
                        </div>

                        {imageUrl && (
                            <div className="relative mt-4 rounded-xl overflow-hidden border border-border bg-black/5 shadow-inner group/image">
                                <img
                                    src={imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`}
                                    alt="Upload preview"
                                    className="max-h-[400px] w-full object-contain"
                                />
                                <button
                                    onClick={() => setImageUrl(null)}
                                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover/image:opacity-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbar Area */}
                <motion.div
                    className={cn(
                        "bg-muted/30 border-t border-border/50 transition-all duration-300",
                        isExpanded ? "px-4 py-3 opacity-100" : "px-4 py-2 opacity-70 hover:opacity-100"
                    )}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            {/* Tool Buttons with Tooltips (simulated via title) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                title="Add Image"
                            >
                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon size={20} />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full text-green-500 hover:text-green-600 hover:bg-green-500/10 transition-colors hidden sm:flex"
                                title="Add GIF"
                                onClick={() => handleFeatureNotImplemented("GIFs")}
                            >
                                <Gift size={20} />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 transition-colors hidden sm:flex"
                                title="Add Chart"
                                onClick={() => handleFeatureNotImplemented("Charts")}
                            >
                                <BarChart2 size={20} />
                            </Button>

                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                                    onClick={() => setShowEmojis(!showEmojis)}
                                    title="Add Emoji"
                                >
                                    <Smile size={20} />
                                </Button>

                                <AnimatePresence>
                                    {showEmojis && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute bottom-full left-0 mb-3 p-3 bg-popover/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/60 z-50 grid grid-cols-5 gap-2 min-w-[220px]"
                                        >
                                            {["🚀", "📈", "📉", "💰", "🔥", "💎", "🙌", "🎯", "🤔", "👀", "🐂", "🐻", "😱", "🍿", "🤑"].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => addEmoji(emoji)}
                                                    className="p-2 hover:bg-muted/50 rounded-xl transition-all hover:scale-110 text-xl leading-none flex items-center justify-center aspect-square"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-popover border-r border-b border-border/60 rotate-45 transform" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                >
                                    <Button
                                        onClick={handlePost}
                                        disabled={(!content.trim() && !imageUrl) || isPosting || isUploading}
                                        size="sm"
                                        className={cn(
                                            "rounded-full px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                                            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                        )}
                                    >
                                        {isPosting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>Posting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} className="mr-2" />
                                                <span>Post</span>
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
