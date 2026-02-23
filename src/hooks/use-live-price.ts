import { useState, useEffect } from 'react';
import { useSocket } from '@/providers/socket-provider';

interface UseLivePriceOptions {
    symbol: string;
    initialPrice: number;
    initialChangePercent: number;
}

interface PriceUpdate {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

export function useLivePrice({ symbol, initialPrice, initialChangePercent }: UseLivePriceOptions) {
    const [price, setPrice] = useState(initialPrice);

    // Calculate initial absolute change from price and percentage
    // Formula: change = (price * (percent/100)) / (1 + percent/100)
    const initialDiff = initialPrice > 0
        ? (initialPrice * (initialChangePercent / 100)) / (1 + (initialChangePercent / 100))
        : 0;

    const [diff, setDiff] = useState(initialDiff);
    const [diffPercent, setDiffPercent] = useState(initialChangePercent);
    const [flash, setFlash] = useState<"up" | "down" | null>(null);

    // Sync state when async data loads and initialPrice becomes available
    useEffect(() => {
        if (initialPrice > 0 && price === 0) {
            setPrice(initialPrice);
            setDiff(
                (initialPrice * (initialChangePercent / 100)) / (1 + (initialChangePercent / 100))
            );
            setDiffPercent(initialChangePercent);
        }
    }, [initialPrice, initialChangePercent, price]);

    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        console.log(`Subscribing to live updates for ${symbol}`);
        socket.emit('subscribeStock', symbol);

        const handlePriceUpdate = (data: PriceUpdate) => {
            if (data.symbol === symbol) {
                setPrice((prev) => {
                    if (data.price !== prev) {
                        setFlash(data.price > prev ? "up" : "down");
                        setTimeout(() => setFlash(null), 300);
                    }
                    return data.price;
                });
                setDiff(data.change || 0);
                setDiffPercent(data.changePercent || 0);
            }
        };

        socket.on('priceUpdate', handlePriceUpdate);

        return () => {
            console.log(`Unsubscribing from ${symbol}`);
            socket.emit('unsubscribeStock', symbol);
            socket.off('priceUpdate', handlePriceUpdate);
        };
    }, [socket, symbol]);

    return {
        price,
        change: diff,
        changePercent: diffPercent,
        flash
    };
}
