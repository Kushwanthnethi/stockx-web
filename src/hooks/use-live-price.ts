import { useState, useEffect, useRef } from 'react';
import { isMarketOpen } from '@/lib/market-time';

interface UseLivePriceOptions {
    initialPrice: number;
    initialChangePercent: number;
}

export function useLivePrice({ initialPrice, initialChangePercent }: UseLivePriceOptions) {
    const [price, setPrice] = useState(initialPrice);
    const [flash, setFlash] = useState<"up" | "down" | null>(null);
    const basePriceRef = useRef(initialPrice / (1 + initialChangePercent / 100));

    useEffect(() => {
        // Reset if initialPrice changes significantly (e.g., page reload)
        if (Math.abs(initialPrice - price) > price * 0.05) {
            setPrice(initialPrice);
            // Recalculate base only on hard reset
            basePriceRef.current = initialPrice / (1 + initialChangePercent / 100);
        }
    }, [initialPrice]);

    useEffect(() => {
        // Only run simulation if market is open
        if (!isMarketOpen()) return;

        const interval = setInterval(() => {
            setPrice((prev) => {
                const volatility = 0.0005; // 0.05%
                const change = prev * (Math.random() - 0.5) * volatility;
                const newPrice = prev + change;

                setFlash(change > 0 ? "up" : "down");
                setTimeout(() => setFlash(null), 300);

                return newPrice;
            });
        }, 3000); // Slower update for smoother feel

        return () => clearInterval(interval);
    }, []);

    const currentChange = price - basePriceRef.current;
    const currentChangePercent = (currentChange / basePriceRef.current) * 100;

    return {
        price,
        change: currentChange,
        changePercent: currentChangePercent,
        flash
    };
}
