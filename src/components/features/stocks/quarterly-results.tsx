
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';

interface QuarterlyMetric {
    date: number;
    formattedDate: string;
    sales: number;
    expenses: number;
    operatingProfit: number;
    opmPercent: number;
    otherIncome: number;
    interest: number;
    depreciation: number;
    pbt: number;
    taxPercent: number;
    netProfit: number;
    eps: number;
}

export function QuarterlyResults({ symbol }: { symbol: string }) {
    const [data, setData] = useState<QuarterlyMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuarterly = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/quarterly`);
                if (res.ok) {
                    const result = await res.json();
                    if (Array.isArray(result)) {
                        // Take last 8-10 quarters for horizontal scroll
                        setData(result.slice(-10));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch quarterly results", error);
            } finally {
                setLoading(false);
            }
        };

        if (symbol) fetchQuarterly();
    }, [symbol]);

    if (loading) return (
        <div className="h-40 flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-card/50 rounded-xl border border-dashed animate-pulse my-6">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading quarterly results...</span>
        </div>
    );

    if (!data || data.length === 0) return (
        <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed my-6">
            Detailed quarterly results are not available for this stock.
        </div>
    );

    const fmt = (val: number, isPct = false, isEPS = false) => {
        if (val === undefined || val === null) return '-';
        if (isPct) return `${val.toFixed(0)}%`;
        if (isEPS) return val.toFixed(2);

        // Convert to Crores
        const cr = val / 10000000;
        if (Math.abs(cr) < 1) return cr.toFixed(2);
        return cr.toFixed(0);
    };

    const rows = [
        { label: "Sales", key: "sales", suffix: "+" },
        { label: "Expenses", key: "expenses", suffix: "+" },
        { label: "Operating Profit", key: "operatingProfit", bold: true },
        { label: "OPM %", key: "opmPercent", isPct: true },
        { label: "Other Income", key: "otherIncome", suffix: "+" },
        { label: "Interest", key: "interest" },
        { label: "Depreciation", key: "depreciation" },
        { label: "Profit before tax", key: "pbt", bold: true },
        { label: "Tax %", key: "taxPercent", isPct: true },
        { label: "Net Profit", key: "netProfit", bold: true, suffix: "+" },
        { label: "EPS in Rs", key: "eps", isEPS: true },
    ];

    return (
        <Card className="mt-8 border shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Quarterly Results
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Consolidated Figures in Rs. Crores
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="sticky left-0 bg-background z-10 w-[180px] pl-6">Metric</TableHead>
                            {data.map((q, idx) => (
                                <TableHead key={idx} className="text-right font-semibold">
                                    {q.formattedDate}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.label} className="hover:bg-muted/20 transition-colors">
                                <TableCell className={cn(
                                    "sticky left-0 bg-background z-10 pl-6 font-medium text-muted-foreground whitespace-nowrap",
                                    row.bold && "font-bold text-foreground"
                                )}>
                                    {row.label} {row.suffix && <span className="text-primary/70 text-[10px] ml-1">{row.suffix}</span>}
                                </TableCell>
                                {data.map((q: any, idx) => (
                                    <TableCell key={idx} className={cn(
                                        "text-right font-mono text-sm",
                                        row.bold && "font-bold text-foreground"
                                    )}>
                                        {fmt(q[row.key as keyof QuarterlyMetric] as number, row.isPct, row.isEPS)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow className="hover:bg-muted/20">
                            <TableCell className="sticky left-0 bg-background z-10 pl-6 font-medium text-muted-foreground">Raw PDF</TableCell>
                            {data.map((_, idx) => (
                                <TableCell key={idx} className="text-right">
                                    <div className="flex justify-end">
                                        <FileText className="w-4 h-4 text-muted-foreground/50 cursor-not-allowed" />
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
