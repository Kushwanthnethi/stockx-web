
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialRow {
    label: string;
    values: (string | number | null)[]; // Ordered by year
    bold?: boolean;
}

interface FinancialTableProps {
    title: string;
    years: string[];
    rows: FinancialRow[];
    className?: string;
}

export function FinancialTable({
    title,
    years,
    rows,
    className,
}: FinancialTableProps) {
    return (
        <Card className={cn("w-full overflow-hidden border-border/50", className)}>
            <CardHeader className="bg-muted/20 px-6 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium tracking-tight">{title}</CardTitle>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Consolidated Figures in Rs. Crores</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/60">
                                <TableHead className="w-[200px] pl-6 font-semibold text-foreground">
                                    Particulars
                                </TableHead>
                                {years.map((year, i) => (
                                    <TableHead
                                        key={i}
                                        className="text-right whitespace-nowrap px-4 font-medium text-foreground/80"
                                    >
                                        {year}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    className={cn(
                                        "hover:bg-muted/30 transition-colors border-border/40",
                                        row.bold && "font-semibold bg-muted/5"
                                    )}
                                >
                                    <TableCell className="pl-6 py-3 text-sm">{row.label}</TableCell>
                                    {row.values.map((val, vIdx) => (
                                        <TableCell key={vIdx} className="text-right px-4 py-3 font-mono text-sm">
                                            {val !== null && val !== undefined ? val.toLocaleString('en-IN') : "--"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
