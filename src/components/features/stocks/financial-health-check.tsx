import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface HealthMetric {
    label: string;
    value: number | string;
    status: 'good' | 'bad' | 'warning';
    description: string;
}

export function FinancialHealthCheck({ stock }: { stock: any }) {
    if (!stock) return null;

    const metrics: HealthMetric[] = [];

    // 1. P/E Ratio Check
    if (stock.peRatio) {
        if (stock.peRatio < 20) {
            metrics.push({ label: 'Valuation (P/E)', value: stock.peRatio.toFixed(2), status: 'good', description: 'Stock is reasonably valued.' });
        } else if (stock.peRatio < 40) {
            metrics.push({ label: 'Valuation (P/E)', value: stock.peRatio.toFixed(2), status: 'warning', description: 'Stock is somewhat expensive.' });
        } else {
            metrics.push({ label: 'Valuation (P/E)', value: stock.peRatio.toFixed(2), status: 'bad', description: 'Stock is trading at a premium.' });
        }
    }

    // 2. Profit Margins
    if (stock.profitMargins) {
        const margin = stock.profitMargins * 100;
        if (margin > 15) {
            metrics.push({ label: 'Profitability', value: `${margin.toFixed(2)}%`, status: 'good', description: 'High profit margins.' });
        } else if (margin > 5) {
            metrics.push({ label: 'Profitability', value: `${margin.toFixed(2)}%`, status: 'warning', description: 'Average profit margins.' });
        } else {
            metrics.push({ label: 'Profitability', value: `${margin.toFixed(2)}%`, status: 'bad', description: 'Low profit margins.' });
        }
    }

    // 3. Debt to Equity
    if (stock.debtToEquity) {
        if (stock.debtToEquity < 50) {
            metrics.push({ label: 'Debt Level', value: stock.debtToEquity.toFixed(2), status: 'good', description: 'Low debt to equity ratio.' });
        } else if (stock.debtToEquity < 100) {
            metrics.push({ label: 'Debt Level', value: stock.debtToEquity.toFixed(2), status: 'warning', description: 'Moderate debt levels.' });
        } else {
            metrics.push({ label: 'Debt Level', value: stock.debtToEquity.toFixed(2), status: 'bad', description: 'High leverage.' });
        }
    }

    // 4. Return on Equity (ROE)
    if (stock.returnOnEquity) {
        const roe = stock.returnOnEquity * 100;
        if (roe > 15) {
            metrics.push({ label: 'Efficiency (ROE)', value: `${roe.toFixed(2)}%`, status: 'good', description: 'Excellent return on equity.' });
        } else if (roe > 8) {
            metrics.push({ label: 'Efficiency (ROE)', value: `${roe.toFixed(2)}%`, status: 'warning', description: 'Fair return on equity.' });
        } else {
            metrics.push({ label: 'Efficiency (ROE)', value: `${roe.toFixed(2)}%`, status: 'bad', description: 'Poor return on equity.' });
        }
    }

    return (
        <Card className="border-none shadow-none bg-muted/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    🏥 Financial Health Check
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-card border">
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                {m.status === 'good' && <CheckCircle2 className="text-green-500 w-5 h-5" />}
                                {m.status === 'warning' && <AlertTriangle className="text-yellow-500 w-5 h-5" />}
                                {m.status === 'bad' && <XCircle className="text-red-500 w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">{m.label}</h4>
                                <p className="text-xs text-muted-foreground">{m.description}</p>
                            </div>
                        </div>
                        <div className={`font-mono font-bold text-sm ${m.status === 'good' ? 'text-green-600' :
                                m.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {m.value}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
