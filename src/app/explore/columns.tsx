"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import { LiveStockTicker } from "@/components/features/stocks/live-stock-ticker";

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

export const columns: ColumnDef<MarketStock>[] = [
    {
        accessorKey: "symbol",
        // header: "Symbol",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="pl-0 hover:bg-transparent font-bold"
            >
                Symbol
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-bold">{row.getValue("symbol")}</div>,
    },
    {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => <div className="text-slate-500 text-xs max-w-[200px] truncate" title={row.getValue("companyName")}>{row.getValue("companyName")}</div>,
    },
    {
        accessorKey: "currentPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-right w-full font-bold justify-end pr-0"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("currentPrice")) || 0;
            const chgPercent = row.original.changePercent || 0;
            // Custom simplified render if LiveTicker is too heavy for 700 rows, 
            // but LiveTicker has useEffect which might be heavy. 
            // For now, let's stick to LiveTicker for liveliness, but maybe optimize later if laggy.
            return <LiveStockTicker symbol={row.original.symbol} initialPrice={price} initialChangePercent={chgPercent} />
        },
    },
    {
        accessorKey: "marketCap",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="text-right w-full font-bold justify-end pr-0"
            >
                Market Cap
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const mc = parseFloat(row.getValue("marketCap")) || 0;
            return <div className="text-right text-slate-500">{(mc / 1e7).toFixed(0)}Cr</div>
        },
    },
    {
        accessorKey: "peRatio",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="text-right w-full font-bold justify-end pr-0"
            >
                P/E
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("peRatio"));
            return <div className="text-right">{val ? val.toFixed(2) : '-'}</div>
        },
    },
    {
        accessorKey: "bookValue",
        header: "Book Val",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("bookValue"));
            return <div className="text-right">{val ? val.toFixed(2) : '-'}</div>
        },
    },
    {
        accessorKey: "dividendYield",
        header: "Div Yld",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("dividendYield"));
            return <div className="text-right">{val ? (val * 100).toFixed(2) + '%' : '-'}</div>
        },
    },
    {
        accessorKey: "returnOnEquity",
        header: "ROE",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("returnOnEquity"));
            return <div className="text-right">{val ? (val * 100).toFixed(2) + '%' : '-'}</div>
        },
    },
    {
        accessorKey: "totalDebt",
        header: "Debt",
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("totalDebt"));
            return <div className="text-right text-slate-500">{val ? (val / 1e7).toFixed(0) + 'Cr' : '-'}</div>
        },
    },
]
