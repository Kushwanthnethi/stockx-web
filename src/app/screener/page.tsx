"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScreenerTable } from "@/components/features/screener/screener-table"
import { useScreener } from "@/hooks/use-screener"
import { TrendingUp, TrendingDown, Activity, Zap, Search } from "lucide-react"

export default function ScreenerPage() {
    const [activeTab, setActiveTab] = useState("gainers")
    const { data, isLoading } = useScreener(activeTab)

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Market Screener</h1>
                    <p className="text-muted-foreground mt-1">
                        Discover potential trading opportunities in the Indian Stock Market.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="gainers" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5 h-auto p-1 bg-muted/50">
                    <TabsTrigger value="gainers" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="hidden sm:inline">Top Gainers</span>
                        <span className="sm:hidden">Gainers</span>
                    </TabsTrigger>
                    <TabsTrigger value="losers" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="hidden sm:inline">Top Losers</span>
                        <span className="sm:hidden">Losers</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="hidden sm:inline">Most Active</span>
                        <span className="sm:hidden">Active</span>
                    </TabsTrigger>
                    <TabsTrigger value="undervalued" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                        <Search className="h-4 w-4 text-purple-500" />
                        <span className="hidden sm:inline">Undervalued</span>
                        <span className="sm:hidden">Value</span>
                    </TabsTrigger>
                    <TabsTrigger value="tech_growth" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="hidden sm:inline">Tech Growth</span>
                        <span className="sm:hidden">Tech</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="gainers">
                        <ScreenerTable data={data} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="losers">
                        <ScreenerTable data={data} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="active">
                        <ScreenerTable data={data} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="undervalued">
                        <ScreenerTable data={data} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="tech_growth">
                        <ScreenerTable data={data} isLoading={isLoading} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
