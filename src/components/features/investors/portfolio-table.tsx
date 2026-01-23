
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stake / Details</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stocks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No investment data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        stocks.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-bold">{item.stockSymbol}</div>
                                        <div className="text-xs text-slate-500">{item.stock.companyName}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'HELD' ? 'default' : 'secondary'}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-slate-700">
                                        {item.quantity || '-'}
                                    </div>
                                    {item.averagePrice && (
                                        <div className="text-xs text-slate-500">
                                            Avg Price: ₹{item.averagePrice}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {item.stock.currentPrice
                                        ? `₹${item.stock.currentPrice.toFixed(2)}`
                                        : '-'
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
