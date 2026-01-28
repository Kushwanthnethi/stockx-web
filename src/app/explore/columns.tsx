"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiveStockTicker } from "@/components/features/stocks/live-stock-ticker";
import { cn } from "@/lib/utils";

// This type maps to the properties returned by the API
export type MarketStock = {
    symbol: string
    companyName: string
    currentPrice: number
    changePercent: number
    marketCap: number
    peRatio: number
    bookValue: number
    dividendYield: number
    returnOnEquity: number
    returnOnAssets: number
    totalDebt: number
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(value);
};

const formatPercent = (value: number) => {
    return (value * 100).toFixed(2) + '%';
};

const formatLargeNumber = (value: number) => {
    if (value >= 1e7) return (value / 1e7).toFixed(2) + 'Cr';
    if (value >= 1e5) return (value / 1e5).toFixed(2) + 'L';
    return value.toString();
};

export const columns: ColumnDef<MarketStock>[] = [
    {
        accessorKey: "symbol",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="pl-0 hover:bg-transparent font-bold text-muted-foreground hover:text-foreground"
            >
                Symbol
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>
                <div className="font-bold text-base text-foreground">{row.getValue("symbol")}</div>
                <div className="text-xs text-muted-foreground font-medium md:hidden">{row.original.companyName}</div>
            </div>
        ),
    },
    {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => <div className="text-foreground text-sm font-medium max-w-[200px] truncate" title={row.getValue("companyName")}>{row.getValue("companyName")}</div>,
    },
    {
        accessorKey: "currentPrice",
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent font-bold text-muted-foreground hover:text-foreground pr-0"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("currentPrice")) || 0;
            const chgPercent = row.original.changePercent || 0;
            return (
                <div className="flex justify-end">
                    <LiveStockTicker symbol={row.original.symbol} initialPrice={price} initialChangePercent={chgPercent} />
                </div>
            )
        },
    },
    {
        accessorKey: "changePercent",
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent font-bold text-muted-foreground hover:text-foreground pr-0"
                >
                    Change %
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const val = row.original.changePercent;
            const isPositive = val >= 0;
            return (
                <div className={cn(
                    "text-right font-semibold flex items-center justify-end gap-1",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                    {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(val).toFixed(2)}%
                </div>
            )
        }
    },
    {
        accessorKey: "marketCap",
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent font-bold text-muted-foreground hover:text-foreground pr-0"
                >
                    Market Cap
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const mc = parseFloat(row.getValue("marketCap")) || 0;
            return <div className="text-right text-foreground font-mono text-sm">{formatLargeNumber(mc)}</div>
        },
    },
    {
        accessorKey: "peRatio",
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent font-bold text-muted-foreground hover:text-foreground pr-0"
                >
                    P/E
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("peRatio"));
            return <div className="text-right text-foreground font-mono text-sm">{val ? val.toFixed(2) : '-'}</div>
        },
    },
    {
        accessorKey: "bookValue",
        header: "Book Val",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("bookValue"));
            return <div className="text-right text-foreground font-mono text-sm">{val ? val.toFixed(2) : '-'}</div>
        },
    },
    {
        accessorKey: "dividendYield",
        header: "Div Yld",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("dividendYield"));
            return <div className="text-right text-foreground font-mono text-sm">{val ? formatPercent(val) : '-'}</div>
        },
    },
    {
        accessorKey: "returnOnEquity",
        header: "ROE",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("returnOnEquity"));
            return <div className={cn("text-right font-mono text-sm", val > 0.15 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>{val ? formatPercent(val) : '-'}</div>
        },
    },
    {
        accessorKey: "totalDebt",
        header: "Debt",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("totalDebt"));
            return <div className="text-right text-foreground font-mono text-sm">{val ? formatLargeNumber(val) : '-'}</div>
        },
    },
]
