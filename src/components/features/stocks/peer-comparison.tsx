import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

interface PeerComparisonProps {
    symbol: string;
    currentStock?: any;
}

export function PeerComparison({ symbol, currentStock }: PeerComparisonProps) {
    const [peers, setPeers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPeers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/peers`);
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

    // Combine current stock and peers for a perfect comparison
    const comparisonList = currentStock && peers.length > 0 && !peers.find(p => p.symbol === currentStock.symbol)
        ? [currentStock, ...peers]
        : peers;

    if (comparisonList.length === 0) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base font-bold">Peer Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider">Company</TableHead>
                            <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-right">Price</TableHead>
                            <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-right">Change</TableHead>
                            <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-right hidden md:table-cell">Mkt Cap</TableHead>
                            <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-right hidden md:table-cell">P/E</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comparisonList.map((peer) => {
                            const isCurrent = peer.symbol === symbol;
                            return (
                                <TableRow
                                    key={peer.symbol}
                                    className={`border-border/40 transition-colors ${isCurrent ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"}`}
                                >
                                    <TableCell className="font-medium p-3">
                                        <Link href={`/stock/${peer.symbol}`} className="hover:underline flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className={`text-[13px] sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px] ${isCurrent ? "text-primary" : "text-foreground"}`}>
                                                    {peer.companyName || peer.symbol}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{peer.symbol}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right p-3 font-mono text-[13px] sm:text-sm font-semibold">
                                        ₹{peer.currentPrice ? peer.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </TableCell>
                                    <TableCell className={`text-right p-3 text-[13px] sm:text-sm font-bold ${peer.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {peer.changePercent >= 0 ? '+' : ''}{peer.changePercent?.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right p-3 hidden md:table-cell text-xs font-medium text-foreground/80">
                                        {peer.marketCap ? `₹${(peer.marketCap / 1e7).toFixed(0)}Cr` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right p-3 hidden md:table-cell text-xs font-semibold text-foreground/90">
                                        {peer.peRatio?.toFixed(2) || '-'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
