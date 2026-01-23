
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={investor.imageUrl} alt={investor.name} />
                    <AvatarFallback>{investor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{investor.name}</CardTitle>
                    {investor.strategy && (
                        <div className="text-xs text-muted-foreground font-medium mt-1">
                            {investor.strategy}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-3">
                    {investor.netWorth && (
                        <div className="text-xs px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md font-mono">
                            NW: {investor.netWorth}
                        </div>
                    )}
                    <div className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                        </span>
                        Live Tracker
                    </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-3">
                    {investor.bio}
                </p>
                <div className="mt-3 pt-3 border-t text-[10px] text-muted-foreground flex justify-between">
                    <span>Holdings Updated</span>
                    <span>~2 Days ago</span>
                </div>
            </CardContent>
        </Card>
    );
}
