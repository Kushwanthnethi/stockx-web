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
    // New Fundamentals
    bookValue?: number;
    dividendYield?: number;
    roe?: number;
    roce?: number;
    totalDebt?: number;
    revenueGrowth?: number;
    earningsGrowth?: number;
    sector?: string;
};

export const useScreener = (type: string, marketCap: string = 'all', count: number = 20) => {
    return useQuery({
        queryKey: ['screener', type, marketCap, count],
        queryFn: async (): Promise<ScreenerStock[]> => {
            const res = await fetch(`${API_BASE_URL}/screener?type=${type}&cap=${marketCap}&count=${count}`);
            if (!res.ok) {
                throw new Error('Failed to fetch screener data');
            }
            return res.json();
        }
    });
};
