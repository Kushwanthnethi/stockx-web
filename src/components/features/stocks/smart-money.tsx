import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';

interface InvestorStock {
    status: 'HELD' | 'SOLD';
    quantity: string | null;
    averagePrice: number | null;
    investor: {
        name: string;
        imageUrl: string | null;
        bio: string | null;
    };
}

interface SmartMoneyProps {
    stock: any;
}

export function SmartMoney({ stock }: SmartMoneyProps) {
    const holdings = stock?.investorStocks as InvestorStock[];

    if (!holdings || holdings.length === 0) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Smart Money
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {holdings.map((start, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={start.investor.imageUrl || ''} />
                                    <AvatarFallback>{start.investor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-sm">{start.investor.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{start.investor.bio}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={start.status === 'HELD' ? 'default' : 'secondary'} className="mb-1">
                                    {start.status}
                                </Badge>
                                {start.quantity && (
                                    <div className="text-xs font-mono text-muted-foreground">
                                        {start.quantity}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
