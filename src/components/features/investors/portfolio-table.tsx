
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface InvestorStock {
    id: string;
    stockSymbol: string;
    status: 'HELD' | 'SOLD';
    quantity?: string;
    averagePrice?: number;
    stock: {
        companyName: string;
        currentPrice?: number;
    };
}

interface PortfolioTableProps {
    stocks: InvestorStock[];
}

export function PortfolioTable({ stocks }: PortfolioTableProps) {
    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold text-muted-foreground w-[200px]">Stock Details</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Stake</TableHead>
                        <TableHead className="text-right font-semibold text-muted-foreground">Value/Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stocks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                No investment data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        stocks.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="font-medium text-foreground flex items-center gap-2">
                                            {item.stockSymbol}
                                            <a href={`/stock/${item.stockSymbol}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpRight size={14} className="text-muted-foreground hover:text-primary" />
                                            </a>
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{item.stock.companyName}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.status === 'HELD' ? 'default' : 'secondary'}
                                        className={cn(
                                            "uppercase text-[10px] tracking-wider font-medium",
                                            item.status === 'HELD' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : ""
                                        )}
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                            {item.quantity || '-'}
                                        </span>
                                        {item.averagePrice && (
                                            <span className="text-[10px] text-muted-foreground">
                                                Avg: ₹{item.averagePrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        {item.stock.currentPrice ? (
                                            <div className="font-mono text-sm text-foreground">
                                                ₹{item.stock.currentPrice.toLocaleString()}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 opacity-80 mt-0.5">
                                            <TrendingUp size={10} /> Live
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
