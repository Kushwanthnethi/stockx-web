
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
    return (
        <div className="rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card text-card-foreground shadow-md dark:shadow-none overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-100 dark:bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]"><Skeleton className="h-4 w-12" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-transparent">
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20 md:hidden" />
                                </div>
                            </TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
