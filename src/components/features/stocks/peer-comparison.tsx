import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PeerComparisonProps {
    symbol: string;
}

export function PeerComparison({ symbol }: PeerComparisonProps) {
    const [peers, setPeers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPeers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3333/stocks/${symbol}/peers`);
                if (res.ok) {
                    const data = await res.json();
                    setPeers(data);
                }
            } catch (error) {
                console.error("Failed to fetch peers", error);
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchPeers();
        }
    }, [symbol]);

    if (loading) return <div className="animate-pulse h-40 bg-muted/20 rounded-xl" />;
    if (peers.length === 0) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Peer Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                            <TableHead className="text-right hidden md:table-cell">Mkt Cap</TableHead>
                            <TableHead className="text-right hidden md:table-cell">P/E</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {peers.map((peer) => (
                            <TableRow key={peer.symbol}>
                                <TableCell className="font-medium">
                                    <Link href={`/stock/${peer.symbol}`} className="hover:underline flex flex-col">
                                        <span>{peer.companyName}</span>
                                        <span className="text-xs text-muted-foreground">{peer.symbol}</span>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right">
                                    ₹{peer.currentPrice?.toFixed(2)}
                                </TableCell>
                                <TableCell className={`text-right ${peer.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {peer.changePercent >= 0 ? '+' : ''}{peer.changePercent?.toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                    {peer.marketCap ? `₹${(peer.marketCap / 1e7).toFixed(0)}Cr` : '-'}
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                    {peer.peRatio?.toFixed(2) || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
