
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface QuarterlyData {
    period: string;
    revenue: number;
    revenueGrowth: number;
    ebitda: number;
    ebitdaMargin: number;
    operatingIncome: number;
    operatingMargin: number;
    netIncome: number;
    netProfitMargin: number;
    eps: number;
}

interface ComparisonData {
    symbol: string;
    currency: string;
    comparisons: {
        current: QuarterlyData;
        prev: QuarterlyData;
        yearAgo: QuarterlyData;
        growth: {
            qoq: any;
            yoy: any;
        };
    };
}

export function QuarterlyResults({ symbol }: { symbol: string }) {
    const [data, setData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuarterly = async () => {
            try {
                const res = await fetch(`http://localhost:3333/stocks/${encodeURIComponent(symbol)}/quarterly`);
                if (res.ok) {
                    try {
                        const result = await res.json();
                        if (result && result.comparisons) {
                            setData(result);
                        }
                    } catch (e) {
                        console.warn('Invalid JSON from quarterly results endpoint', e);
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
            <span>Loading financial performance...</span>
        </div>
    );

    if (!data || !data.comparisons || !data.comparisons.current) return (
        <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed my-6">
            Detailed quarterly performance data is not available for this stock.
        </div>
    );

    const { current, prev, yearAgo, growth } = data.comparisons;
    const currency = data.currency || 'INR';
    const hasYearAgo = !!yearAgo;

    const fmtVal = (val: number, isCurrency = true) => {
        if (val === undefined || val === null) return '-';
        if (isCurrency) return `${(val / 10000000).toFixed(0)}Cr`;
        return val.toFixed(2);
    };

    const fmtPct = (val: number) => {
        if (val === undefined || val === null) return '-';
        return `${(val * 100).toFixed(1)}%`;
    };

    const GrowthIndicator = ({ value }: { value: number | null }) => {
        if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
        const isPos = value > 0;
        const isNeg = value < 0;

        return (
            <div className={cn(
                "flex items-center gap-1 font-medium px-2 py-0.5 rounded text-xs w-fit",
                isPos ? "bg-green-500/10 text-green-700 dark:text-green-400" :
                    isNeg ? "bg-red-500/10 text-red-700 dark:text-red-400" :
                        "bg-slate-100 text-slate-600"
            )}>
                {isPos ? <ArrowUp className="w-3 h-3" /> : isNeg ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>{Math.abs(value * 100).toFixed(1)}%</span>
            </div>
        );
    };

    const rows = [
        { label: "Revenue / Sales", key: "revenue", isCurrency: true, growthKey: "revenue" },
        { label: "EBITDA", key: "ebitda", isCurrency: true, growthKey: "ebitda" },
        { label: "EBITDA Margin %", key: "ebitdaMargin", isPct: true },
        { label: "Operating Profit", key: "operatingIncome", isCurrency: true, growthKey: "operatingIncome" },
        { label: "Info: OPM %", key: "operatingMargin", isPct: true },
        { label: "Net Profit", key: "netIncome", isCurrency: true, growthKey: "netIncome" },
        { label: "Net Profit Margin %", key: "netProfitMargin", isPct: true },
        { label: "EPS", key: "eps", isCurrency: false, growthKey: "eps" },
    ];

    return (
        <Card className="mt-8 border-none shadow-md bg-gradient-to-br from-card to-card/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Detailed Quarterly Performance
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Comparing <strong>{current.period}</strong> with previous quarters.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="w-fit font-mono">Currency: {currency}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[30%] pl-6 py-4">Metric</TableHead>
                            <TableHead className="text-right py-4">Current <span className="block text-[10px] font-normal text-muted-foreground">{current.period}</span></TableHead>
                            <TableHead className="text-right py-4">Prev <span className="block text-[10px] font-normal text-muted-foreground">{prev?.period || '-'}</span></TableHead>
                            <TableHead className="text-right w-[120px] py-4">Growth (QoQ)</TableHead>
                            {hasYearAgo && (
                                <>
                                    <TableHead className="text-right py-4">Year Ago <span className="block text-[10px] font-normal text-muted-foreground">{yearAgo.period}</span></TableHead>
                                    <TableHead className="text-right w-[120px] py-4">Growth (YoY)</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow key={row.label} className={cn("transition-colors", i % 2 === 0 ? "bg-background/40" : "bg-muted/10")}>
                                <TableCell className="pl-6 py-3 font-medium text-muted-foreground">{row.label}</TableCell>

                                {/* Current */}
                                <TableCell className="text-right font-mono font-bold text-foreground">
                                    {row.isPct ? fmtPct((current as any)[row.key]) : fmtVal((current as any)[row.key], row.isCurrency)}
                                </TableCell>

                                {/* Prev */}
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {row.isPct ? fmtPct((prev as any)?.[row.key]) : fmtVal((prev as any)?.[row.key], row.isCurrency)}
                                </TableCell>

                                {/* QoQ Growth */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <GrowthIndicator value={growth.qoq[row.growthKey as any]} />
                                    </div>
                                </TableCell>

                                {/* Year Ago */}
                                {hasYearAgo && (
                                    <>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {row.isPct ? fmtPct((yearAgo as any)[row.key]) : fmtVal((yearAgo as any)[row.key], row.isCurrency)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <GrowthIndicator value={growth.yoy[row.growthKey as any]} />
                                            </div>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <div className="bg-muted/20 p-3 text-center border-t">
                <p className="text-[10px] text-muted-foreground">
                    * Data sourced from public financial reports via Yahoo Finance. "Cr" = Crores.
                </p>
            </div>
        </Card>
    );
}
