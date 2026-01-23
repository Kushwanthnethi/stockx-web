// src/mocks/handlers.ts

export interface User {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string; // Placeholder string
    verified?: boolean;
}

export interface Stock {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    sector: string;
    about: string;
}

export interface Post {
    id: string;
    user: User;
    content: string;
    tags: { symbol: string; change?: number }[];
    likes: number;
    comments: number;
    timestamp: string;
    sentiment?: 'BULLISH' | 'BEARISH';
    imageUrl?: string;
}

const MOCK_USERS: Record<string, User> = {
    'u1': {
        id: 'u1',
        name: 'Arjun Mehta',
        handle: '@arjun_invests',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
        verified: true
    },
    'u2': {
        id: 'u2',
        name: 'Priya Sharma',
        handle: '@priya_charts',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    },
    'u3': {
        id: 'u3',
        name: 'Market Insider',
        handle: '@market_insider',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Market',
    }
};

export const MOCK_POSTS: Post[] = [
    {
        id: 'p1',
        user: MOCK_USERS['u1'],
        content: 'TCS results were decent, but guidance is weak. I expect some consolidation in the IT sector for the next quarter. Watching $INFY closely as well.',
        tags: [
            { symbol: 'TCS', change: -1.2 },
            { symbol: 'INFY', change: 0.5 }
        ],
        likes: 124,
        comments: 18,
        timestamp: '2h ago',
        sentiment: 'BEARISH'
    },
    {
        id: 'p2',
        user: MOCK_USERS['u2'],
        content: 'Massive breakout in $TATAMOTORS on the daily chart! Volume is confirming the move. EV sales numbers are looking very promising.',
        tags: [
            { symbol: 'TATAMOTORS', change: 3.4 }
        ],
        likes: 890,
        comments: 145,
        timestamp: '4h ago',
        sentiment: 'BULLISH'
    },
    {
        id: 'p3',
        user: MOCK_USERS['u3'],
        content: 'Reliance AGM date announced. Usually a catalyst for the stock. $RELIANCE has been underperforming Nifty for the last month.',
        tags: [
            { symbol: 'RELIANCE', change: 0.1 }
        ],
        likes: 56,
        comments: 5,
        timestamp: '5h ago'
    }
];

export const MOCK_STOCKS: Record<string, Stock> = {
    'TATAMOTORS': {
        symbol: 'TATAMOTORS',
        companyName: 'Tata Motors Ltd',
        price: 945.60,
        change: 32.15,
        changePercent: 3.52,
        sector: 'Automotive',
        about: 'Tata Motors Limited is a leading global automobile manufacturer of cars, utility vehicles, buses, trucks and defense vehicles.'
    },
    'TCS': {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        price: 3980.00,
        change: -45.20,
        changePercent: -1.12,
        sector: 'IT Services',
        about: 'Tata Consultancy Services is an IT services, consulting and business solutions organization that has been partnering with many of the world’s largest businesses in their transformation journeys.'
    },
    'INFY': {
        symbol: 'INFY',
        companyName: 'Infosys Ltd',
        price: 1650.45,
        change: 8.20,
        changePercent: 0.50,
        sector: 'IT Services',
        about: 'Infosys is a global leader in next-generation digital services and consulting.'
    }
};

export async function getStockDetails(symbol: string): Promise<Stock | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_STOCKS[symbol.toUpperCase()] || null;
}

export async function getPostsByStock(symbol: string): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const s = symbol.toUpperCase();
    return MOCK_POSTS.filter(p => p.tags.some(t => t.symbol === s));
}

export async function getFeedPosts(): Promise<Post[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_POSTS;
}
