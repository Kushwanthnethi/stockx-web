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
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No stocks found for this category.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">% Change</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">PE Ratio</TableHead>
                        <TableHead className="text-right hidden xl:table-cell">52W High</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((stock) => {
                        const isPositive = stock.change >= 0;
                        return (
                            <TableRow key={stock.symbol}>
                                <TableCell className="font-medium">{stock.symbol}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={stock.companyName}>
                                    {stock.companyName}
                                </TableCell>
                                <TableCell className="text-right">₹{stock.price?.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-right", isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                    {stock.change > 0 ? "+" : ""}{stock.change?.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={isPositive ? "default" : "destructive"} className={cn("ml-auto w-fit flex items-center gap-1", isPositive ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400")}>
                                        {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                                        {Math.abs(stock.changePercent).toFixed(2)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{(stock.volume / 100000).toFixed(2)}L</TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                    {stock.marketCap ? `₹${(stock.marketCap / 10000000).toFixed(2)}Cr` : '-'}
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell">{stock.peRatio?.toFixed(2) || '-'}</TableCell>
                                <TableCell className="text-right hidden xl:table-cell">₹{stock.fiftyTwoWeekHigh?.toFixed(2) || '-'}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
