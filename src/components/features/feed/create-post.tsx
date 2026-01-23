'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Image as ImageIcon, X, Smile, BarChart2, FileText, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const { user, isLoading } = useAuth();
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user || isLoading) return null;

    const addEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmojis(false);
    };

    async function handlePost() {
        if (!content.trim() && !imageUrl) return;

        setIsPosting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:3333/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content, imageUrl }),
            });

            if (res.ok) {
                setContent('');
                setImageUrl(null);
                if (onPostCreated) {
                    onPostCreated();
                }
            } else {
                console.error('Failed to post');
            }
        } catch (error) {
            console.error('Error posting', error);
        } finally {
            setIsPosting(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:3333/posts/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
            }
        } catch (error) {
            console.error('Error uploading image', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="mb-6 border-none shadow-sm">
            <CardContent className="pt-4">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={user.avatarUrl} alt={user.firstName || user.handle} />
                        <AvatarFallback>{(user.firstName?.[0] || user.handle[0]).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's your analysis?"
                            className="w-full min-h-[80px] text-lg resize-none border-none focus:ring-0 outline-none placeholder:text-slate-400"
                        />

                        {imageUrl && (
                            <div className="relative mt-2 rounded-lg overflow-hidden border">
                                <img src={imageUrl} alt="Upload preview" className="max-h-60 w-full object-cover" />
                                <button
                                    onClick={() => setImageUrl(null)}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t pt-3">
                            <div className="flex gap-1">
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
                                    className="text-blue-600 hover:bg-blue-50 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon size={20} />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-600 hover:bg-blue-50 rounded-full"
                                >
                                    <Gift size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-600 hover:bg-blue-50 rounded-full"
                                >
                                    <BarChart2 size={20} />
                                </Button>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-blue-600 hover:bg-blue-50 rounded-full"
                                        onClick={() => setShowEmojis(!showEmojis)}
                                    >
                                        <Smile size={20} />
                                    </Button>

                                    {showEmojis && (
                                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-xl border z-50 grid grid-cols-5 gap-1 min-w-[160px]">
                                            {['🚀', '📈', '📉', '💰', '🔥', '💎', '🙌', '🎯', '🤔', '👀'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => addEmoji(emoji)}
                                                    className="p-2 hover:bg-slate-100 rounded transition-colors text-lg"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-600 hover:bg-blue-50 rounded-full"
                                >
                                    <FileText size={20} />
                                </Button>
                            </div>
                            <Button
                                onClick={handlePost}
                                disabled={(!content.trim() && !imageUrl) || isPosting || isUploading}
                                size="sm"
                                className="rounded-full px-6 font-bold"
                            >
                                {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
