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

    const isExpanded = isFocused || content.length > 0 || imageUrl;

    return (
        <motion.div
            layout
            className="mb-6 bg-card/50 backdrop-blur-md border border-border/50 shadow-sm rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-primary/20 hover:shadow-md"
        >
            <div className="p-4 flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-background shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={user.firstName || user.handle} />
                    <AvatarFallback>{(user.firstName?.[0] || user.handle[0]).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => !content && !imageUrl && setIsFocused(false)} // Stick open if content exists
                        placeholder="What&apos;s your market analysis?"
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/60 text-lg resize-none min-h-[40px] max-h-[300px] leading-relaxed"
                        style={{ overflow: "hidden" }}
                    />

                    {imageUrl && (
                        <div className="relative mt-3 rounded-lg overflow-hidden border border-border bg-black/5">
                            <img
                                src={imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`}
                                alt="Upload preview"
                                className="max-h-[320px] w-full object-contain"
                            />
                            <button
                                onClick={() => setImageUrl(null)}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-muted/30 border-t border-border/40 px-3 py-2"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex gap-0.5">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-full transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    title="Add Image"
                                >
                                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon size={20} />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-green-500 hover:text-green-600 hover:bg-green-500/10 rounded-full transition-colors"
                                    title="Add GIF (Coming Soon)"
                                >
                                    <Gift size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-full transition-colors"
                                    title="Add Chart (Coming Soon)"
                                >
                                    <BarChart2 size={20} />
                                </Button>

                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-full transition-colors"
                                        onClick={() => setShowEmojis(!showEmojis)}
                                        title="Add Emoji"
                                    >
                                        <Smile size={20} />
                                    </Button>

                                    {showEmojis && (
                                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-popover rounded-xl shadow-xl border border-border z-50 grid grid-cols-5 gap-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
                                            {["🚀", "📈", "📉", "💰", "🔥", "💎", "🙌", "🎯", "🤔", "👀"].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => addEmoji(emoji)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors text-xl leading-none flex items-center justify-center"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handlePost}
                                disabled={(!content.trim() && !imageUrl) || isPosting || isUploading}
                                size="sm"
                                className="rounded-full px-6 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                            >
                                {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                                Post
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
