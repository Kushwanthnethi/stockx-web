"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { ScreenerStock } from "@/hooks/use-screener"
import { cn } from "@/lib/utils"

interface ScreenerTableProps {
    data: ScreenerStock[] | undefined
    isLoading: boolean
}

export function ScreenerTable({ data, isLoading }: ScreenerTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground text-lg">No stocks match these criteria currently.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting filters or checking back later.</p>
            </div>
        )
    }

    const formatCurrency = (val: number | undefined) => {
        if (val === undefined || val === null) return '-';
        return `₹${val.toFixed(2)}`;
    }

    const formatPercent = (val: number | undefined) => {
        if (val === undefined || val === null) return '-';
        return `${(val * 100).toFixed(2)}%`;
    }

    const formatCr = (val: number | undefined) => {
        if (val === undefined || val === null) return '-';
        return `₹${(val / 10000000).toFixed(0)}Cr`;
    }

    return (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]">Company</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Change %</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Market Cap</TableHead>
                            <TableHead className="text-right">P/E</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Sales Growth</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Profit Growth</TableHead>
                            <TableHead className="text-right">ROE</TableHead>
                            <TableHead className="text-right">ROCE</TableHead>
                            <TableHead className="text-right">Debt</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((stock) => {
                            const isPositive = stock.change >= 0;
                            return (
                                <TableRow key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{stock.symbol}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={stock.companyName}>
                                                {stock.companyName}
                                            </span>
                                            {stock.sector && <span className="text-[10px] text-primary/80 mt-0.5">{stock.sector}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(stock.price)}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={isPositive ? "default" : "destructive"}
                                            className={cn("ml-auto w-fit flex items-center gap-1 font-bold",
                                                isPositive ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300")}>
                                            {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                                            {Math.abs(stock.changePercent).toFixed(2)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">{formatCr(stock.marketCap)}</TableCell>
                                    <TableCell className="text-right font-mono text-sm">{stock.peRatio?.toFixed(1) || '-'}</TableCell>

                                    <TableCell className={cn("text-right font-mono text-sm", (stock.revenueGrowth || 0) > 0 ? "text-green-600 dark:text-green-400" : "")}>
                                        {formatPercent(stock.revenueGrowth)}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-mono text-sm", (stock.earningsGrowth || 0) > 0 ? "text-green-600 dark:text-green-400" : "")}>
                                        {formatPercent(stock.earningsGrowth)}
                                    </TableCell>

                                    <TableCell className="text-right font-mono text-sm">{formatPercent(stock.roe)}</TableCell>
                                    <TableCell className="text-right font-mono text-sm">{formatPercent(stock.roce)}</TableCell>
                                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCr(stock.totalDebt)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
