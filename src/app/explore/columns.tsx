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
        header: "Symbol",
        cell: ({ row }) => <div className="font-bold">{row.getValue("symbol")}</div>,
    },
    {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => <div className="text-slate-500 text-xs max-w-[150px] truncate">{row.getValue("companyName")}</div>,
    },
    {
        accessorKey: "currentPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-right w-full font-bold"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("currentPrice")) || 0;
            // Use row.original to access data directly, as the column ID might not be in the row model
            // Backend sends percentage (e.g. 1.5 for 1.5%), so use directly.
            const chgPercent = row.original.changePercent || 0;

            return <LiveStockTicker symbol={row.original.symbol} initialPrice={price} initialChangePercent={chgPercent} />
        },
    },
    // We can remove the separate Change column or keep it static?
    // If LivePrice shows both, we might want to drop this column to avoid duplicates.
    // Let's modify the columns list to REMOVE the "Change" column if we are merging them.
    // BUT the user might want sorting on Change.
    // Strategy: Keep "Change" column for sorting/data, but maybe render it simply or hide it.
    // Let's try rendering LivePrice in the Price column and see.
    // I will replace the Change column content with null or something if merged,
    // but for now let's just use LivePrice in Price column.

    // WAIT, if I replace the cell content, the sorting on "currentPrice" still works based on data.

    /* 
    {
        accessorKey: "changePercent",
        header: "Change",
        cell: ({ row }) => null // Hide content if merged into Price column? 
    },
    */

    {
        accessorKey: "marketCap",
        header: "Market Cap",
        cell: ({ row }) => {
            const mc = parseFloat(row.getValue("marketCap")) || 0;
            // Format as Cr (Crores) usually for India, straightforward billions for now
            return <div className="text-right text-slate-500">{(mc / 1e7).toFixed(0)}Cr</div>
        },
    },
    {
        accessorKey: "peRatio",
        header: "P/E",
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
