"use client";

import React, { useState, useEffect } from 'react';
import { VerdictCard, VerdictType } from '@/components/features/verdict/verdict-card';
import { Sparkles, RefreshCw, Search, ArrowDownCircle } from 'lucide-react';
import { SiteHeader } from "@/components/layout/site-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";

// Static Verdict Definition (without price data)
const VERDICT_DEFINITIONS = [
    {
        id: 1,
        symbol: "TCS",
        verdict: "HOLD" as VerdictType,
        catalyst: "Q3 Earnings Miss & Margin Pressure",
        headline: "Solid fundamentals, but short-term headwinds persist.",
        rationale: "While the Q3 numbers missed estimates, the deal pipeline remains robust at $8.1B. The market has already priced in the slowdown. Long-term holders should stay put, but no rush to add fresh capital until US discretionary spend clarity emerges.",
        date: "Jan 19, 2026"
    },
    {
        id: 2,
        symbol: "HDFCBANK",
        verdict: "BUY" as VerdictType,
        catalyst: "Merger Synergies Starting to Kick In",
        headline: "The giant is waking up. Valuation is too cheap to ignore.",
        rationale: "Trading at 2.1x P/B, HDFC Bank is at a historic valuation low. NIMs have bottomed out and deposit growth is finally outpacing credit. This is a classic 'buy when others are bored' scenario for a 3-5 year horizon.",
        date: "Jan 20, 2026"
    },
    {
        id: 3,
        symbol: "BHARTIARTL",
        verdict: "BUY" as VerdictType,
        catalyst: "ARPU Growth & 5G Monetization",
        headline: "Telecom duopoly power is intensifying.",
        rationale: "With tariff hikes fully absorbed and 5G capex peaking, free cash flow is set to explode. Airtel remains the premium play in the Indian telecom space with superior execution compared to peers. Ideally positioned for the next phase of growth.",
        date: "Jan 21, 2026"
    },
    {
        id: 4,
        symbol: "ICICIBANK",
        verdict: "BUY" as VerdictType,
        catalyst: "Digital Leadership & Retail Growth",
        headline: "The most consistent compounder in the banking space.",
        rationale: "ICICI continues to fire on all cylinders with 18% ROE and best-in-class tech stack. Valuation is reasonable compared to historical averages. A must-have core holding.",
        date: "Jan 22, 2026"
    },
    {
        id: 5,
        symbol: "RELIANCE",
        verdict: "BUY" as VerdictType,
        catalyst: "New Energy Business Value Unlocking",
        headline: "The Green Energy pivot is the next big growth engine.",
        rationale: "The market is undervaluing the New Energy vertical. With the gigafactory coming online ahead of schedule, RIL is poised for a re-rating similar to the Jio launch era. Accumulate on dips.",
        date: "Jan 21, 2026"
    },
    {
        id: 6,
        symbol: "ADANIENT",
        verdict: "WAIT" as VerdictType,
        catalyst: "Infrastructure CAPEX Cycle",
        headline: "High growth but high leverage concerns remain.",
        rationale: "The aggressive expansion into airports and roads is promising, but the debt levels warrant caution. We need to see consistent cash flow generation from these new assets before committing fresh capital.",
        date: "Jan 20, 2026"
    },
    {
        id: 7,
        symbol: "INFY",
        verdict: "HOLD" as VerdictType,
        catalyst: "Guidance Cut",
        headline: "Steady ship, but growth engine is sputtering.",
        rationale: "Guidance cut was expected, but margins are holding up. Dividend yield is attractive. Not a growth compounder right now, but a safe defensive bet in a volatile IT environment.",
        date: "Jan 21, 2026"
    },
    {
        id: 8,
        symbol: "ITC",
        verdict: "BUY" as VerdictType,
        catalyst: "Hotel Demerger News",
        headline: "Value unlocking event on the horizon.",
        rationale: "The FMCG business is scaling well with improved margins. The hotel business demerger will unlock significant shareholder value. A classic defensive stock that pays you to wait.",
        date: "Jan 21, 2026"
    },
    {
        id: 9,
        symbol: "TMPV",
        verdict: "WAIT" as VerdictType,
        catalyst: "JLR Sales Data",
        headline: "JLR slowdown concerns outweigh EV growth.",
        rationale: "Domestic EV dominance is great, but JLR brings the bulk of the profits. European slowdown suggests caution. Wait for the cycle to turn before aggressive entry.",
        date: "Jan 21, 2026"
    },
    {
        id: 10,
        symbol: "BAJFINANCE",
        verdict: "BUY" as VerdictType,
        catalyst: "Rural Demand Recovery",
        headline: "The King of NBFCs is back to winning ways.",
        rationale: "Asset quality remains pristine despite the aggressive growth. The rural demand recovery is a massive tailwind. At current valuations, you are getting growth at a reasonable price (GARP).",
        date: "Jan 21, 2026"
    },
    {
        id: 11,
        symbol: "MARUTI",
        verdict: "HOLD" as VerdictType,
        catalyst: "SUV Market Share Gains",
        headline: "SUV strategy is working, but EV transition is slow.",
        rationale: "Maruti has successfully defended its turf with new SUV launches. However, the slow EV rollout compared to Tata Motors is a long-term risk. Hold for the steady dividends and market leadership.",
        date: "Jan 20, 2026"
    },
    {
        id: 12,
        symbol: "TITAN",
        verdict: "BUY" as VerdictType,
        catalyst: "Wedding Season Demand",
        headline: "Gold rush continues giving Titan the glitter.",
        rationale: "Jewelry business growth is accelerating. Tanishq's brand power allows them to pass on gold price hikes without denting demand. A premium compounder that deserves a premium valuation.",
        date: "Jan 21, 2026"
    },
    {
        id: 13,
        symbol: "AXISBANK",
        verdict: "BUY" as VerdictType,
        catalyst: "Citi Portfolio Integration",
        headline: "Integration pains are over, time for gains.",
        rationale: "The Citi consumer business integration is complete and synergies are visible. ROE is trending towards 18%. This is the top pick in the banking space after HDFC Bank.",
        date: "Jan 20, 2026"
    },
    {
        id: 14,
        symbol: "SUNPHARMA",
        verdict: "WAIT" as VerdictType,
        catalyst: "Specialty Business US FDA Checks",
        headline: "Regulatory overhang clouds the specialty growth story.",
        rationale: "The specialty portfolio is the jewel, but recent FDA observations at Halol and Mohali are concerning. Wait for the compliance issues to be resolved before entering.",
        date: "Jan 19, 2026"
    },
    {
        id: 15,
        symbol: "ULTRACEMCO",
        verdict: "BUY" as VerdictType,
        catalyst: "Pan-India Capacity Expansion",
        headline: "The infrastructure bet you cannot ignore.",
        rationale: "With government capex firing on all cylinders, the largest cement player is the primary beneficiary. Volume growth visibility is high for the next 3 years.",
        date: "Jan 21, 2026"
    },
    {
        id: 16,
        symbol: "TATASTEEL",
        verdict: "HOLD" as VerdictType,
        catalyst: "China Stimulus & UK Transition",
        headline: "Global headwinds persist, but restructuring is a long-term positive.",
        rationale: "The transition to green steel in the UK is capital intensive and will drag near-term cash flows. However, any meaningful stimulus in China could trigger a sharp rally. Hold for the cyclical upturn.",
        date: "Jan 22, 2026"
    },
    {
        id: 17,
        symbol: "HCLTECH",
        verdict: "BUY" as VerdictType,
        catalyst: "AI Deal Wins",
        headline: "Quietly winning the AI services race.",
        rationale: "HCL Tech's recent large deal wins in the AI and Cloud space are impressive. It trades at a discount to TCS and Infosys while offering a better dividend yield. A solid defensive pick.",
        date: "Jan 21, 2026"
    },
    {
        id: 18,
        symbol: "M&M",
        verdict: "BUY" as VerdictType,
        catalyst: "New SUV Launch Pipeline",
        headline: "Firing on all cylinders: Auto + Farm.",
        rationale: "The SUV order book is massive, and supply chain issues are easing. The farm equipment sector is also bottoming out. M&M is the best play on rural recovery + urban consumption.",
        date: "Jan 20, 2026"
    },
    {
        id: 19,
        symbol: "NTPC",
        verdict: "BUY" as VerdictType,
        catalyst: "Renewable Energy IPO Value Unlocking",
        headline: "A utility giant transforming into a green energy major.",
        rationale: "NTPC Green Energy IPO is a major catalyst. The core thermal business is a cash cow that funds this transition. Low risk, high visibility of earnings growth.",
        date: "Jan 22, 2026"
    },
    {
        id: 20,
        symbol: "POWERGRID",
        verdict: "HOLD" as VerdictType,
        catalyst: "Transmission Capex Growth",
        headline: "Safe dividend play, but limited capital appreciation.",
        rationale: "The regulated return model ensures safety, but growth is capped until the next large capex cycle for green energy transmission kicks off fully. Good for income investors.",
        date: "Jan 19, 2026"
    },
    {
        id: 21,
        symbol: "KOTAKBANK",
        verdict: "WAIT" as VerdictType,
        catalyst: "CEO Transition & Tech Upgrade",
        headline: "Premium valuation needs premium growth delivery.",
        rationale: "The bank is going through a leadership transition and tech overhaul. Credit growth has lagged peers. Wait for signs of acceleration before paying the premium multiple.",
        date: "Jan 21, 2026"
    },
    {
        id: 22,
        symbol: "LT",
        verdict: "BUY" as VerdictType,
        catalyst: "Record Order Book Execution",
        headline: "The proxy for India's infrastructure boom.",
        rationale: "With an all-time high order book, revenue visibility is clear for the next 3 years. Margins are expected to improve as legacy low-margin orders are completed. A core portfolio holding.",
        date: "Jan 22, 2026"
    },
    {
        id: 23,
        symbol: "SBIN",
        verdict: "BUY" as VerdictType,
        catalyst: "Asset Quality Improvement",
        headline: "The elephant can dance.",
        rationale: "SBI has cleaned up its books remarkably. ROA is consistently above 1%. Validations remain attractive compared to private peers. Best proxy for the Indian economy.",
        date: "Jan 20, 2026"
    },
    {
        id: 24,
        symbol: "HINDUNILVR",
        verdict: "HOLD" as VerdictType,
        catalyst: "Rural Volatility",
        headline: "Volume growth remains elusive.",
        rationale: "While margins are protected by premiumization, mass-market volumes are still under pressure. Competition from regional players is high. Fairly valued for now.",
        date: "Jan 22, 2026"
    },
    {
        id: 25,
        symbol: "ASIANPAINT",
        verdict: "WAIT" as VerdictType,
        catalyst: "Crude Price & Competition",
        headline: "Paint war is heating up.",
        rationale: "Entry of Grasim (Birla Opus) is disrupting the pricing power. Margins could see compression in the near term. Wait for the competitive intensity to settle.",
        date: "Jan 19, 2026"
    },
    {
        id: 26,
        symbol: "ADANIPORTS",
        verdict: "BUY" as VerdictType,
        catalyst: "Logistics Volume Growth",
        headline: "Gateway to India's trade growth.",
        rationale: "Consistent cargo volume growth and new acquisitions. The cash cow of the Adani group. A solid infrastructure play.",
        date: "Jan 21, 2026"
    },
    {
        id: 27,
        symbol: "WIPRO",
        verdict: "WAIT" as VerdictType,
        catalyst: "Turnaround Plan Execution",
        headline: "Still waiting for the turnaround to yield results.",
        rationale: "Revenue growth lags peers significantly. The new CEO's strategy needs more time to play out. Better opportunities exist in HCL Tech or TCS.",
        date: "Jan 18, 2026"
    },
    {
        id: 28,
        symbol: "DRREDDY",
        verdict: "BUY" as VerdictType,
        catalyst: "Biosimilars Pipeline",
        headline: "US Generics stability + Biosimilars upside.",
        rationale: "Strong US pipeline and no major FDA issues. Valuation is attractive relative to peers. A good defensive pharma bet.",
        date: "Jan 22, 2026"
    },
    {
        id: 29,
        symbol: "CIPLA",
        verdict: "HOLD" as VerdictType,
        catalyst: "Domestic Market Leadership",
        headline: "One-India strategy is working.",
        rationale: "Domestic formulations business is a cash machine. However, US respiratory franchise faces competition. Fairly valued.",
        date: "Jan 20, 2026"
    },
    {
        id: 30,
        symbol: "GRASIM",
        verdict: "BUY" as VerdictType,
        catalyst: "Paints & Chemicals Growth",
        headline: "A conglomerate discount that is too steep.",
        rationale: "Holding company discount for UltraTech is high. Paints business launch is a key trigger. VSF business remains a cash cow.",
        date: "Jan 21, 2026"
    },
    {
        id: 31,
        symbol: "NESTLEIND",
        verdict: "BUY" as VerdictType,
        catalyst: "Premiumization Wave",
        headline: "Defensive moat with pricing power.",
        rationale: "Nestle continues to command pricing power. Maggi and Coffee volumes are robust. A safe haven for volatile markets.",
        date: "Jan 22, 2026"
    },
    {
        id: 32,
        symbol: "JSWSTEEL",
        verdict: "BUY" as VerdictType,
        catalyst: "Capacity Expansion",
        headline: "Scaling up to meet India's steel demand.",
        rationale: "Capacity expansion to 37 MTPA is on track. Best placed to capture the domestic infrastructure led demand.",
        date: "Jan 21, 2026"
    },
    {
        id: 33,
        symbol: "INDUSINDBK",
        verdict: "HOLD" as VerdictType,
        catalyst: "Deposit Growth Challenges",
        headline: "Asset quality fits, but liability franchise needs work.",
        rationale: "Credit costs are under control, but deposit mobilization is expensive. Return ratios are good but stock lacks a strong trigger.",
        date: "Jan 20, 2026"
    },
    {
        id: 34,
        symbol: "HINDALCO",
        verdict: "BUY" as VerdictType,
        catalyst: "Novelis IPO & Copper Demand",
        headline: "Novelis value unlocking & Green Metal play.",
        rationale: "Aluminum prices are firming up. Novelis provides steady cash flows. Debt reduction is a positive.",
        date: "Jan 22, 2026"
    },
    {
        id: 35,
        symbol: "DIVISLAB",
        verdict: "BUY" as VerdictType,
        catalyst: "CDMO Recovery",
        headline: "The worst is behind.",
        rationale: "Contract manufacturing demand is returning. Margins have bottomed out. A high-quality franchise trading at reasonable valuations.",
        date: "Jan 21, 2026"
    },
    {
        id: 36,
        symbol: "SBILIFE",
        verdict: "BUY" as VerdictType,
        catalyst: "Protection Gap",
        headline: "Market leader in private life insurance.",
        rationale: "Distribution strength via SBI branches is unmatched. VNB margins are stable. Long runway for growth.",
        date: "Jan 22, 2026"
    },
    {
        id: 37,
        symbol: "HDFCLIFE",
        verdict: "HOLD" as VerdictType,
        catalyst: "Budget Taxation Changes",
        headline: "Product mix change in progress.",
        rationale: "Shift from high-ticket non-par policies to protection involves near-term margin pain. Long term story intact.",
        date: "Jan 20, 2026"
    },
    {
        id: 38,
        symbol: "EICHERMOT",
        verdict: "BUY" as VerdictType,
        catalyst: "Royal Enfield Export Growth",
        headline: "Riding the retro wave globally.",
        rationale: "New Himalayan 450 and Shotgun 650 are hits. Export markets opening up. VECV business is also cyclically strong.",
        date: "Jan 21, 2026"
    },
    {
        id: 39,
        symbol: "BPCL",
        verdict: "HOLD" as VerdictType,
        catalyst: "Oil Marketing Margins",
        headline: "Dividend yield support, but policy risk remains.",
        rationale: "Marketing margins are volatile. Dividends are good, but lack of privatization news caps upside.",
        date: "Jan 19, 2026"
    },
    {
        id: 40,
        symbol: "BRITANNIA",
        verdict: "BUY" as VerdictType,
        catalyst: "Rural Distribution Expansion",
        headline: "Cookie king consolidating share.",
        rationale: "Direct reach expansion in rural India is driving volume growth. Cheese and Dairy segments are scaling well.",
        date: "Jan 22, 2026"
    },
    {
        id: 41,
        symbol: "TATACONSUM",
        verdict: "BUY" as VerdictType,
        catalyst: "Distribution Synergies",
        headline: "Transforming into a full-fledged FMCG major.",
        rationale: "Integration of Sampann and Soulfull is yielding results. Margins are expanding. A structural growth story.",
        date: "Jan 21, 2026"
    },
    {
        id: 42,
        symbol: "TECHM",
        verdict: "HOLD" as VerdictType,
        catalyst: "Telecom 5G Capex",
        headline: "Waiting for the telecom spending cycle.",
        rationale: "Heavy dependence on communications vertical is a drag currently. Turnaround strategy under new CEO is a work in progress.",
        date: "Jan 20, 2026"
    },
    {
        id: 43,
        symbol: "LTIM",
        verdict: "BUY" as VerdictType,
        catalyst: "Merger Synergies",
        headline: "Best of both worlds: Scale + Agility.",
        rationale: "Merger integration is largely behind. Cross-selling opportunities are substantial. Valuation discount to Tier-1 offers safety.",
        date: "Jan 21, 2026"
    },
    {
        id: 44,
        symbol: "ONGC",
        verdict: "BUY" as VerdictType,
        catalyst: "KG Basin Production Ramp-up",
        headline: "Production growth after years of stagnation.",
        rationale: "KG-98/2 production is boosting output. Dividend yield of ~6% is attractive. Low PE valuation provides margin of safety.",
        date: "Jan 22, 2026"
    },
    {
        id: 45,
        symbol: "COALINDIA",
        verdict: "BUY" as VerdictType,
        catalyst: "Power Demand Surge",
        headline: "Fueling India's energy needs.",
        rationale: "Power demand is outpacing supply, ensuring healthy offtake. E-auction premiums are stable. Dividend yield is top-tier.",
        date: "Jan 21, 2026"
    },
    {
        id: 46,
        symbol: "HEROMOTOCO",
        verdict: "WAIT" as VerdictType,
        catalyst: "EV Market Share",
        headline: "Vida needs to scale up fast.",
        rationale: "Losing share in the core 100cc segment. EV presence is still negligible compared to Ola/TVS. Wait for successful new launches.",
        date: "Jan 19, 2026"
    },
    {
        id: 47,
        symbol: "BAJAJ-AUTO",
        verdict: "BUY" as VerdictType,
        catalyst: "Premiumization & Triumph Partnership",
        headline: "Export recovery + Premium wins.",
        rationale: "Triumph partnership is a game changer. Chetak EV is ramping up well. Export markets are showing signs of bottoming out.",
        date: "Jan 21, 2026"
    },
    {
        id: 48,
        symbol: "APOLLOHOSP",
        verdict: "BUY" as VerdictType,
        catalyst: "Apollo 24/7 Breakeven",
        headline: "Healthcare ecosystem leader.",
        rationale: "Targeting breakeven for the online pharmacy business. Hospital occupancy is robust. A long-term structural winner.",
        date: "Jan 22, 2026"
    },
    {
        id: 49,
        symbol: "BEL",
        verdict: "BUY" as VerdictType,
        catalyst: "Defense Indigenization",
        headline: "Order book visibility for 3+ years.",
        rationale: "Government push for 'Make in India' in defense is the biggest tailwind. Strong execution track record. Premium valuation is justified.",
        date: "Jan 22, 2026"
    },
    {
        id: 50,
        symbol: "TRENT",
        verdict: "BUY" as VerdictType,
        catalyst: "Zudio Expansion",
        headline: "Fashion retailer that defies gravity.",
        rationale: "Zudio's aggressive store addition is driving massive topline growth. Margins are industry leading. Expensive, but growth is scarce.",
        date: "Jan 22, 2026"
    }
];

export default function VerdictPage() {
    const [filter, setFilter] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [verdicts, setVerdicts] = useState<any[]>([]); // Initialize empty, fill after fetch
    // Keep a separate state to know if we are fetching live prices
    const [isFetchingPrices, setIsFetchingPrices] = useState(true);

    useEffect(() => {
        const fetchLivePrices = async () => {
            setIsFetchingPrices(true);
            try {
                // Get all symbols from definitions and ensure they have .NS suffix for Indian market
                const symbols = VERDICT_DEFINITIONS.map(v => v.symbol.endsWith('.NS') ? v.symbol : `${v.symbol}.NS`);

                // Call our new batch endpoint
                const res = await fetch(`${API_BASE_URL}/stocks/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbols })
                });

                if (!res.ok) throw new Error("Failed to fetch batch prices");

                const liveData = await res.json();

                // Merge Live Data with Definitions
                // Create a map for fast lookup. 
                // We map BOTH "TCS.NS" and "TCS" to the same data to be safe.
                const priceMap = new Map();
                liveData.forEach((s: any) => {
                    priceMap.set(s.symbol, s); // e.g. TCS.NS
                    const shortSymbol = s.symbol.replace('.NS', '');
                    priceMap.set(shortSymbol, s); // e.g. TCS
                });

                const mergedData = VERDICT_DEFINITIONS.map(def => {
                    const stock = priceMap.get(def.symbol); // Should work with short symbol now
                    // If we found live data, use it. Else fallback to placeholders (or 0)
                    return {
                        ...def,
                        companyName: stock?.companyName || def.symbol, // Use real name if avail
                        price: stock?.currentPrice || 0,
                        change: (stock?.changePercent / 100) * stock?.currentPrice || 0, // Approx absolute change if not in DB
                        // Actually our DB has changePercent. change abs value might need calc:
                        // change = currentPrice - (currentPrice / (1 + changePercent/100))
                        // Simpler: just use changePercent for display if change is missing? 
                        // The card expects 'change' (absolute) and 'changePercent'
                        // Let's ensure our backend returns both or we calc it.
                        // Our backend 'Stock' model has 'currentPrice' and 'changePercent'.
                        changePercent: stock?.changePercent || 0,
                        // inferred absolute change:
                        // P_curr = P_prev * (1 + pct/100) -> P_prev = P_curr / (1 + pct/100) -> Chg = P_curr - P_prev
                        // Calculation:
                        // prev = current / (1 + (percent/100))
                        // chg = current - prev
                    };
                }).map(item => {
                    // Refine the absolute change calc
                    if (item.price && item.changePercent) {
                        const prevPrice = item.price / (1 + (item.changePercent / 100));
                        const absChange = item.price - prevPrice;
                        return { ...item, change: absChange };
                    }
                    return { ...item, change: 0 };
                });

                setVerdicts(mergedData);

            } catch (error) {
                console.error("Error fetching live prices:", error);
                // Fallback: use definitions with 0 prices to at least show the cards
                setVerdicts(VERDICT_DEFINITIONS.map(v => ({ ...v, price: 0, change: 0, changePercent: 0 })));
            } finally {
                setIsFetchingPrices(false);
            }
        };

        fetchLivePrices();
    }, []);

    const filteredVerdicts = verdicts.filter(v =>
        v.symbol.toLowerCase().includes(filter.toLowerCase()) ||
        v.companyName.toLowerCase().includes(filter.toLowerCase())
    );

    const visibleVerdicts = filteredVerdicts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredVerdicts.length;

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        // Simulate network delay for effect
        setTimeout(() => {
            setVisibleCount(prev => prev + 6);
            setIsLoadingMore(false);
        }, 600);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <div className="lg:col-span-10">
                    <div className="flex flex-col gap-6">

                        {/* Header Section */}
                        <div className="flex flex-col gap-4 border-b pb-8 bg-card/30 p-6 rounded-2xl">
                            <div className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-sm">
                                <Sparkles className="h-4 w-4" />
                                <span>Premium Intelligence | NIFTY 50 Coverage</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl">
                                The <span className="text-primary">Verdict</span>
                            </h1>
                            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
                                We translate complex market noise into clear, psychological signals.
                                Answering the only question that matters: <span className="text-foreground font-medium italic">"If I were a long-term investor, what would I do now?"</span>
                            </p>

                            <div className="flex items-center gap-4 mt-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Nifty 50 Verdicts..."
                                        className="pl-9 bg-background/50"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center px-3 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                    Live / Closing Prices (Delayed 15m)
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        {isFetchingPrices && verdicts.length === 0 ? (
                            <div className="flex justify-center items-center py-20">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {visibleVerdicts.map((verdict) => (
                                    <VerdictCard
                                        key={verdict.id}
                                        {...verdict}
                                        // Use Closing Price Format
                                        price={`₹${verdict.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                        change={`${verdict.change > 0 ? '+' : ''}${verdict.change.toFixed(2)}`}
                                        isPositiveChange={verdict.change >= 0}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More Section */}
                        {hasMore && !isFetchingPrices && (
                            <div className="flex justify-center pt-8">
                                <Button
                                    variant="outline"
                                    className="gap-2 min-w-[200px]"
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Loading Data...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownCircle className="h-4 w-4" />
                                            Load More Nifty 50 Data
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {!hasMore && filteredVerdicts.length > 0 && (
                            <div className="flex justify-center pt-8 text-muted-foreground text-sm opacity-60">
                                You've reached the end of the list.
                            </div>
                        )}

                        {filteredVerdicts.length === 0 && !isFetchingPrices && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                                <p>No verdicts found for "{filter}"</p>
                                <Button variant="link" onClick={() => setFilter('')} className="mt-2 text-primary">
                                    Clear Search
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
