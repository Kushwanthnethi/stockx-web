import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';
import { FinancialHealthCheck } from './financial-health-check';

interface FundamentalsExpandedProps {
    stock: any;
}

export function FundamentalsExpanded({ stock }: FundamentalsExpandedProps) {
    if (!stock) return null;

    const formatCurrency = (val: number) => {
        if (!val) return '-';
        return `₹${(val / 10000000).toFixed(0)}Cr`; // Convert to Crores
    };

    const formatPercent = (val: number) => {
        if (!val) return '-';
        return `${(val * 100).toFixed(2)}%`;
    };

    const sections = [
        {
            title: "Valuation",
            items: [
                { label: "Market Cap", value: formatCurrency(stock.marketCap) },
                { label: "P/E Ratio", value: stock.peRatio?.toFixed(2) },
                { label: "P/B Ratio", value: stock.pbRatio?.toFixed(2) },
                { label: "EV/EBITDA", value: stock.ebitda ? (stock.marketCap / stock.ebitda).toFixed(2) : '-' }, // Rough proxy
            ]
        },
        {
            title: "Profitability",
            items: [
                { label: "ROE", value: formatPercent(stock.returnOnEquity) },
                { label: "ROA", value: formatPercent(stock.returnOnAssets) },
                { label: "Profit Margin", value: formatPercent(stock.profitMargins) },
                { label: "Operating Margin", value: formatPercent(stock.operatingMargins) },
            ]
        },
        {
            title: "Financial Strength",
            items: [
                { label: "Total Debt", value: formatCurrency(stock.totalDebt) },
                { label: "Debt/Equity", value: stock.debtToEquity?.toFixed(2) },
                { label: "Current Ratio", value: stock.currentRatio?.toFixed(2) },
                { label: "Quick Ratio", value: stock.quickRatio?.toFixed(2) },
            ]
        },
        {
            title: "Growth",
            items: [
                { label: "Revenue Growth", value: formatPercent(stock.revenueGrowth) },
                { label: "Earnings Growth", value: formatPercent(stock.earningsGrowth) },
                { label: "Free Cash Flow", value: formatCurrency(stock.freeCashflow) },
            ]
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4 group">
                    View More Fundamentals
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Fundamentals: {stock.symbol}</DialogTitle>
                    <DialogDescription>
                        Comprehensive financial data and health analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Health Check */}
                    <div className="bg-muted/10 rounded-xl">
                        <FinancialHealthCheck stock={stock} />
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-6">
                        {sections.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="flex flex-col p-3 bg-muted/50 rounded-lg">
                                            <span className="text-xs text-muted-foreground mb-1">{item.label}</span>
                                            <span className="text-sm font-mono font-medium">{item.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-xs flex gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            Data sourced from annual and quarterly reports. Market data is delayed by 15 minutes.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
