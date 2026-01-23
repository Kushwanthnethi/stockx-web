import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

interface WatchButtonProps {
    symbol: string;
    className?: string; // Add className prop for flexibility
}

export function WatchButton({ symbol, className }: WatchButtonProps) {
    const { user } = useAuth();
    const [isWatching, setIsWatching] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        // Check initial status
        // Ideally we fetch the whole watchlist once and check, but for now we can fetch per button or rely on parent
        // For simplicity/robustness, let's just fetch the user's watchlist to check
        // Optimization: In a real app, pass `isWatching` as prop or use React Query
        fetchWatchStatus();
    }, [user, symbol]);

    const fetchWatchStatus = async () => {
        try {
            if (!user) return;
            // We use the watchlist endpoint to see if this symbol is in it
            // Or we can just try to toggle? No.
            // Let's assume we can check via getWatchlist or similar. 
            // Actually, let's implement a 'check' or just fetch all.
            const res = await fetch(`http://localhost:3333/stocks/user/${user.id}/watchlist`);
            if (res.ok) {
                const data = await res.json();
                const found = data.find((w: any) => w.stockSymbol === symbol);
                setIsWatching(!!found);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleWatch = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3333/stocks/${symbol}/watch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                const data = await res.json();
                setIsWatching(data.watching);
            }
        } catch (error) {
            console.error('Failed to toggle watchlist', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleWatch}
            disabled={loading}
            className={cn("gap-2", className)} // Merge className
        >
            <Star
                className={cn("h-4 w-4", isWatching ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
            />
            {isWatching ? "Watching" : "Watch"}
        </Button>
    );
}
