
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Result Corner | StocksX',
    description: 'Track financial result announcements from top NSE & BSE companies. Stay ahead of market movements with real-time updates.',
};

export default function ResultsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
