import React from 'react';
import { useLivePrice } from '@/hooks/use-live-price';
import { LivePrice } from './live-price';

interface LiveStockTickerProps {
    initialPrice: number;
    initialChangePercent: number;
    symbol: string;
}

export function LiveStockTicker({ initialPrice, initialChangePercent, symbol }: LiveStockTickerProps) {
    const { price, change, changePercent, flash } = useLivePrice({
        initialPrice,
        initialChangePercent
    });

    return (
        <LivePrice
            price={price}
            change={change}
            changePercent={changePercent}
            flash={flash}
        />
    );
}
