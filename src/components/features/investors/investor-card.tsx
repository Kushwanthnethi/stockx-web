import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InvestorCardProps {
    investor: {
        id: string;
        name: string;
        bio?: string;
        imageUrl?: string;
        strategy?: string;
        netWorth?: string;
        lastUpdated?: string;
    };
    onClick?: () => void;
    isSelected?: boolean;
}

export function InvestorCard({ investor, onClick, isSelected }: InvestorCardProps) {
    return (
        <Card
            onClick={onClick}
            className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border",
                isSelected
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-foreground/20"
            )}
        >
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={investor.imageUrl} alt={investor.name} className="object-cover" />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                        {investor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <CardTitle className="text-base font-semibold text-foreground">
                        {investor.name}
                    </CardTitle>

                    {investor.strategy && (
                        <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full inline-block">
                            {investor.strategy}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                    {investor.netWorth && (
                        <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="opacity-70">NW:</span>
                            {investor.netWorth}
                        </div>
                    )}
                </div>
                {/* Optional Bio - currently hidden to keep it minimal as per redesign request, or we can add it back if needed */}
            </CardContent>
        </Card>
    );
}
