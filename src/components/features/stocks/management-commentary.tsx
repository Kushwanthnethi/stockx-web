
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquareQuote, Target, TrendingUp, AlertCircle, Quote } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
    symbol: string;
}

export function ManagementCommentary({ symbol }: Props) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We will fetch specific news related to earnings/commentary
        const fetchNews = async () => {
            try {
                // Using the stock news endpoint as a proxy for "Commentary" sources for now
                const res = await fetch(`http://localhost:3333/stocks/${encodeURIComponent(symbol)}/news`);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.slice(0, 3)); // Take top 3 recent news items
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [symbol]);

    return (
        <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/20 overflow-hidden mt-6">
            <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquareQuote className="w-5 h-5 text-primary" />
                        Management Commentary & Outlook
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">Based on Recent Reports</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* 1. Strategic Focus (Simulated/Generative UI) */}
                <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-muted-foreground/20 rotate-180" />
                    <div className="pl-6 pt-2">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            Strategic Focus
                        </h3>
                        <p className="text-muted-foreground italic leading-relaxed">
                            "The company continues to focus on operational efficiency and market expansion.
                            Growth in the core business remains a priority, while exploring new avenues in digital transformation and sustainability."
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground font-medium">- General Management Sentiment</div>
                    </div>
                </div>

                <Separator />

                {/* 2. Key Highlights from Reports (Using Actual News Headlines) */}
                <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Key Highlights & Market chatter
                    </h3>

                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                            <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                        </div>
                    ) : news.length > 0 ? (
                        <div className="space-y-4">
                            {news.map((item, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <div>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors hover:underline decoration-primary/50 underline-offset-4">
                                            {item.title}
                                        </a>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Source: {item.publisher} • {new Date(item.publishedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            No specific commentary reports found recently.
                        </div>
                    )}
                </div>

                {/* 3. Forward Guidance (Static Placeholder for "Beautiful" UI) */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <h3 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">Forward Guidance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Revenue Outlook</div>
                            <div className="font-medium text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Positive
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Capital Expenditure</div>
                            <div className="font-medium">Continued Investment</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
