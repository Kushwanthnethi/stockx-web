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

    const formatCurrency = (val: number | null | undefined) => {
        if (val === null || val === undefined || val === 0) return '-';
        if (Math.abs(val) >= 1e12) return `₹${(val / 1e12).toFixed(2)}T`;
        if (Math.abs(val) >= 1e7) return `₹${(val / 1e7).toFixed(0)}Cr`;
        if (Math.abs(val) >= 1e5) return `₹${(val / 1e5).toFixed(1)}L`;
        return `₹${val.toFixed(2)}`;
    };

    const formatPercent = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        // Values from Yahoo/calculated are typically decimals (0.15 = 15%)
        const pct = Math.abs(val) < 1 ? val * 100 : val;
        return `${pct.toFixed(2)}%`;
    };

    const formatRatio = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        return val.toFixed(2);
    };

    const formatPrice = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        return `₹${val.toFixed(2)}`;
    };

    const sections = [
        {
            title: "VALUATION",
            color: "text-blue-400",
            items: [
                { label: "Market Cap", value: formatCurrency(stock.marketCap) },
                { label: "EPS", value: stock.eps ? `₹${stock.eps.toFixed(2)}` : '-' },
                { label: "P/E Ratio", value: formatRatio(stock.peRatio) },
                { label: "P/B Ratio", value: formatRatio(stock.pbRatio) },
                { label: "Book Value/Share", value: formatPrice(stock.bookValuePerShare) },
                { label: "Enterprise Value", value: formatCurrency(stock.enterpriseValue) },
                { label: "EV/EBITDA", value: formatRatio(stock.evEbitda) },
                { label: "EBITDA", value: formatCurrency(stock.ebitda) },
            ]
        },
        {
            title: "PROFITABILITY",
            color: "text-green-400",
            items: [
                { label: "ROE", value: formatPercent(stock.returnOnEquity) },
                { label: "ROA", value: formatPercent(stock.returnOnAssets) },
                { label: "ROCE", value: formatPercent(stock.returnOnCapitalEmployed) },
                { label: "Net Profit Margin", value: formatPercent(stock.profitMargins) },
                { label: "Operating Margin", value: formatPercent(stock.operatingMargins) },
                { label: "Gross Margin", value: formatPercent(stock.grossMargin) },
            ]
        },
        {
            title: "FINANCIAL STRENGTH",
            color: "text-yellow-400",
            items: [
                { label: "Total Debt", value: formatCurrency(stock.totalDebt) },
                { label: "Debt/Equity", value: formatRatio(stock.debtToEquity) },
                { label: "Current Ratio", value: formatRatio(stock.currentRatio) },
                { label: "Quick Ratio", value: formatRatio(stock.quickRatio) },
                { label: "Interest Coverage", value: formatRatio(stock.interestCoverageRatio) },
            ]
        },
        {
            title: "GROWTH",
            color: "text-red-400",
            items: [
                { label: "Revenue Growth (YoY)", value: formatPercent(stock.revenueGrowth) },
                { label: "Earnings Growth (YoY)", value: formatPercent(stock.earningsGrowth) },
                { label: "EPS Growth", value: formatPercent(stock.epsGrowth) },
                { label: "Dividend Yield", value: formatPercent(stock.dividendYield) },
            ]
        },
        {
            title: "CASH FLOW",
            color: "text-purple-400",
            items: [
                { label: "Operating Cash Flow", value: formatCurrency(stock.operatingCashFlow) },
                { label: "Free Cash Flow", value: formatCurrency(stock.freeCashflow) },
                { label: "FCF Margin", value: formatPercent(stock.fcfMargin) },
                { label: "Cash Flow to Debt", value: formatRatio(stock.cashFlowToDebt) },
            ]
        },
        {
            title: "ADVANCED VALUATION",
            color: "text-blue-300",
            items: [
                { label: "PEG Ratio", value: formatRatio(stock.pegRatio) },
                { label: "Graham Number", value: formatPrice(stock.grahamNumber) },
                { label: "Intrinsic Value (DCF)", value: formatPrice(stock.intrinsicValue) },
            ]
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4 group">
                    View All Fundamentals
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Fundamentals: {stock.symbol}</DialogTitle>
                    <DialogDescription>
                        Comprehensive financial data and health analysis. Institutional-grade calculations.
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
                                <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${section.color}`}>
                                    {section.title}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="flex flex-col p-3 bg-muted/50 rounded-lg border border-border/30">
                                            <span className="text-xs text-muted-foreground mb-1">{item.label}</span>
                                            <span className="text-sm font-mono font-medium">{item.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-blue-950/30 text-blue-300 rounded-lg text-xs flex gap-2 border border-blue-800/30">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            Data sourced from annual reports via Yahoo Finance. ROE/ROA use average equity/assets for institutional-grade accuracy.
                            Intrinsic Value uses a 10-year DCF model with 10% discount rate.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
