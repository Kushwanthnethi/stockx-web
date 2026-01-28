import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '@/lib/config';

export type ScreenerStock = {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    exchange: string;
};

export const useScreener = (type: string) => {
    return useQuery({
        queryKey: ['screener', type],
        queryFn: async (): Promise<ScreenerStock[]> => {
            const res = await fetch(`${API_BASE_URL}/screener?type=${type}`);
            if (!res.ok) {
                throw new Error('Failed to fetch screener data');
            }
            return res.json();
        }
    });
};
