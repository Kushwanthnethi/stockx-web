"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScreenerTable } from "@/components/features/screener/screener-table"
import { useScreener } from "@/hooks/use-screener"
import { TrendingUp, TrendingDown, Activity, Zap, Search, Layers, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ScreenerPage() {
    const [activeTab, setActiveTab] = useState("gainers")
    const [marketCapFilter, setMarketCapFilter] = useState("all") // 'all', 'large', 'mid', 'small'
    const [count, setCount] = useState(20)

    const { data, isLoading, isFetching } = useScreener(activeTab, marketCapFilter, count)

    const handleLoadMore = () => {
        setCount(prev => prev + 20)
    }

    const MarketCapFilter = () => (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Layers className="h-4 w-4" /> Market Cap:
            </span>
            {['all', 'large', 'mid', 'small'].map((cap) => (
                <Button
                    key={cap}
                    variant={marketCapFilter === cap ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setMarketCapFilter(cap); setCount(20); }} // Reset count on filter change
                    className="capitalize text-xs h-8"
                >
                    {cap === 'all' ? 'All Stocks' : `${cap} Cap`}
                </Button>
            ))}
        </div>
    )

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StockX Screener
                </h1>
                <p className="text-muted-foreground text-lg">
                    Advanced screening tool with deep fundamental insights.
                </p>
                <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="font-normal">Real-time Data</Badge>
                    <Badge variant="outline" className="font-normal border-primary/20 text-primary">NSE/BSE Only</Badge>
                </div>
            </div>

            <Tabs defaultValue="gainers" onValueChange={(val) => { setActiveTab(val); setCount(20); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5 h-auto p-1 bg-muted/50 mb-6">
                    <TabsTrigger value="gainers" className="gap-2 py-2.5">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="hidden sm:inline">Top Gainers</span>
                        <span className="sm:hidden">Gainers</span>
                    </TabsTrigger>
                    <TabsTrigger value="losers" className="gap-2 py-2.5">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="hidden sm:inline">Top Losers</span>
                        <span className="sm:hidden">Losers</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="gap-2 py-2.5">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="hidden sm:inline">Most Active</span>
                        <span className="sm:hidden">Active</span>
                    </TabsTrigger>
                    <TabsTrigger value="undervalued" className="gap-2 py-2.5">
                        <Search className="h-4 w-4 text-purple-500" />
                        <span className="hidden sm:inline">Undervalued</span>
                        <span className="sm:hidden">Value</span>
                    </TabsTrigger>
                    <TabsTrigger value="tech_growth" className="gap-2 py-2.5">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="hidden sm:inline">Tech Growth</span>
                        <span className="sm:hidden">Tech</span>
                    </TabsTrigger>
                </TabsList>

                <MarketCapFilter />

                {/* Content Area */}
                <div className="min-h-[400px]">
                    <ScreenerTable data={data} isLoading={isLoading && count === 20} />
                </div>

                {/* Load More Area */}
                {!isLoading && data && data.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="min-w-[200px]"
                        >
                            {isFetching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                "Load More Stocks"
                            )}
                        </Button>
                    </div>
                )}
                {!isLoading && data && data.length === 0 && (
                    <div className="flex justify-center mt-8">
                        <span className="text-muted-foreground text-sm">No more results to load.</span>
                    </div>
                )}
            </Tabs>
        </div>
    )
}
