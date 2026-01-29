"use client";

import React, { useState, useEffect } from 'react';
import { VerdictCard, VerdictType } from '@/components/features/verdict/verdict-card';
import { Sparkles, RefreshCw, Search, ArrowDownCircle, Layers, TrendingUp } from 'lucide-react';


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { PremiumGuard } from "@/components/shared/premium-guard";
import { cn } from "@/lib/utils";

// --- Data Definitions ---

const LARGE_CAP_VERDICTS = [
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

const MID_CAP_VERDICTS = [
    {
        id: 101,
        symbol: "TATAPOWER",
        verdict: "BUY" as VerdictType,
        catalyst: "Renewable Energy Transition",
        headline: "Charging India's electric future.",
        rationale: "Pivot to green energy is accelerating. EV charging network dominance and strong solar EPC order book makes it a prime mid-to-large cap crossover candidate.",
        date: "Jan 23, 2026"
    },
    {
        id: 102,
        symbol: "TVSMOTOR",
        verdict: "BUY" as VerdictType,
        catalyst: "EV Market Leadership",
        headline: "The dark horse of the EV race.",
        rationale: "iQube is gaining significant traction. Unlike legacy peers, TVS is aggressive in the premium EV space. Exports are also recovering. A top pick in auto ancillaries/OEMs.",
        date: "Jan 23, 2026"
    },
    {
        id: 103,
        symbol: "ZOMATO",
        verdict: "BUY" as VerdictType,
        catalyst: "Path to Profitability",
        headline: "Finally serving profits, not just discounts.",
        rationale: "Blinkit acquisition is proving to be a masterstroke. Core food delivery is adjusted EBITDA positive. The platform tax is real, and consumers are paying. (Parent: Eternal)",
        date: "Jan 24, 2026"
    },
    {
        id: 104,
        symbol: "IDFCFIRSTB",
        verdict: "BUY" as VerdictType,
        catalyst: "Retailization of Loan Book",
        headline: "Building a fortress bank from scratch.",
        rationale: "Asset quality checks out. High CASA ratio improvement is key. The management's focus on ethical banking and customer-first approach is building strong brand loyalty.",
        date: "Jan 23, 2026"
    },
    {
        id: 105,
        symbol: "BEL", // Often considered large/mid bridge, included in both contextually or removed if dupe
        verdict: "BUY" as VerdictType,
        catalyst: "Defense Export Orders",
        headline: "Defense autonomy champion.",
        rationale: "Record order book ensures revenue visibility for 4 years. Margins are stable. A no-brainer hold in any defense-themed portfolio.",
        date: "Jan 22, 2026"
    },
    {
        id: 106,
        symbol: "POLYCAB",
        verdict: "BUY" as VerdictType,
        catalyst: "Real Estate Boom",
        headline: "Wiring the nation's infrastructure.",
        rationale: "Market leader in wires & cables. B2C mix is increasing, aiding margins. Beneficiary of both housing boom and industrial capex.",
        date: "Jan 23, 2026"
    },
    {
        id: 107,
        symbol: "KPITTECH",
        verdict: "BUY" as VerdictType,
        catalyst: "Software Defined Vehicles",
        headline: "Pure play automotive tech winner.",
        rationale: "Auto OEMs are becoming software companies, and KPIT is their partner. Niche focus allows for premium pricing. High growth visibility.",
        date: "Jan 24, 2026"
    },
    {
        id: 108,
        symbol: "UNIONBANK",
        verdict: "HOLD" as VerdictType,
        catalyst: "PSU Rally Consolidation",
        headline: "Cheap valuation, but growth needs to catch up.",
        rationale: "Turnaround is visible, but the easy money in PSU banks has been made. Hold for dividend and modest book value compounding.",
        date: "Jan 23, 2026"
    },
    {
        id: 109,
        symbol: "L&TFH",
        verdict: "BUY" as VerdictType,
        catalyst: "Lakshya 2026 Goals",
        headline: "Retail transformation is complete.",
        rationale: "Wholesale book drag is gone. Now a pure retail franchise with improving ROA. Rerating candidate.",
        date: "Jan 24, 2026"
    },
    {
        id: 110,
        symbol: "PAYTM",
        verdict: "WAIT" as VerdictType,
        catalyst: "Regulatory Clarity",
        headline: "Survival mode on, thriving mode pending.",
        rationale: "RBI actions have clipped wings. Focus on merchant loans is good, but regulatory overhang remains high. High risk, high reward.",
        date: "Jan 23, 2026"
    },
    {
        id: 111,
        symbol: "TATAELXSI",
        verdict: "HOLD" as VerdictType,
        catalyst: "ER&D Spending Recovery",
        headline: "Premium valuation for premium capabilities.",
        rationale: "Design and engineering prowess is unmatched, but stock is priced to perfection. Wait for a dip to enter this high-quality compounder.",
        date: "Jan 23, 2026"
    },
    {
        id: 112,
        symbol: "APOLLOTYRE",
        verdict: "BUY" as VerdictType,
        catalyst: "Pricing Discipline",
        headline: "Rolling smoothly on better margins.",
        rationale: "Raw material costs are benign. Focus on premium tires in Europe and India is boosting margins. ROCE is improving.",
        date: "Jan 24, 2026"
    },
    {
        id: 113,
        symbol: "ASTRAL",
        verdict: "BUY" as VerdictType,
        catalyst: "Capacity Expansion",
        headline: "Piping hot growth.",
        rationale: "Dominant player in CPVC. Entry into paints and adhesives creates a complete home building material ecosystem. Expensive but consistent.",
        date: "Jan 23, 2026"
    },
    {
        id: 114,
        symbol: "CUMMINSIND",
        verdict: "BUY" as VerdictType,
        catalyst: "Data Center Boom",
        headline: "Powering the data revolution.",
        rationale: "Genset demand from data centers and manufacturing units is at an all-time high. CPCB IV+ transition is a key trigger.",
        date: "Jan 24, 2026"
    },
    {
        id: 115,
        symbol: "OBEROIRLTY",
        verdict: "BUY" as VerdictType,
        catalyst: "Mumbai Real Estate Cycle",
        headline: "Premium luxury play.",
        rationale: "Strong launch pipeline in Mumbai. Clean balance sheet. Best play on the luxury housing upcycle.",
        date: "Jan 23, 2026"
    },
    {
        id: 116,
        symbol: "ASHOKLEY",
        verdict: "BUY" as VerdictType,
        catalyst: "CV Upcycle",
        headline: "Commercial Vehicle cycle is steady.",
        rationale: "Market share gains in MHCV segment. Switch Mobility (EV arm) value unlocking could be a major positive surprise.",
        date: "Jan 24, 2026"
    },
    {
        id: 117,
        symbol: "ABCAPITAL",
        verdict: "BUY" as VerdictType,
        catalyst: "Digital Super App",
        headline: "Fintech ambition with conglomerate backing.",
        rationale: "Aggressive growth targets under new leadership. ABCD app is gaining traction. Lending book is growing smartly.",
        date: "Jan 24, 2026"
    },
    {
        id: 118,
        symbol: "PRESTIGE",
        verdict: "BUY" as VerdictType,
        catalyst: "Bangalore Market Leadership",
        headline: "Sales bookings at record high.",
        rationale: "Expansion into Mumbai is succeeding. Annuity income from office portfolio provides stability. Top pick in real estate.",
        date: "Jan 23, 2026"
    },
    {
        id: 119,
        symbol: "DEEPAKNTR",
        verdict: "HOLD" as VerdictType,
        catalyst: "China Dumping",
        headline: "Phenol spreads need to stabilize.",
        rationale: "Capacity expansion is on track, but short term pressure from cheap Chinese imports is hurting margins. Long term story intact.",
        date: "Jan 23, 2026"
    },
    {
        id: 120,
        symbol: "GMRINFRA",
        verdict: "BUY" as VerdictType,
        catalyst: "Air Traffic Growth",
        headline: "Airports are the new malls.",
        rationale: "Passenger traffic is booming. Non-aero revenue (retail at airports) is a high margin growth driver. Debt reduction is key to watch.",
        date: "Jan 24, 2026"
    },
    {
        id: 121,
        symbol: "SUZLON",
        verdict: "HOLD" as VerdictType,
        catalyst: "Debt Free Status",
        headline: "Turnaround complete, execution key.",
        rationale: "Balance sheet is clean. Order book is full. Now users need to see timely delivery of turbines to justify the re-rating.",
        date: "Jan 23, 2026"
    },
    {
        id: 122,
        symbol: "PERSISTENT",
        verdict: "BUY" as VerdictType,
        catalyst: "Mid-tier IT outperformance",
        headline: "Consistent compounder.",
        rationale: "Delivering industry leading growth for 12 quarters. Strong focus on healthcare and BFSI tech. A safer bet than large cap IT for growth.",
        date: "Jan 24, 2026"
    },
    {
        id: 123,
        symbol: "INDHOTEL",
        verdict: "BUY" as VerdictType,
        catalyst: "Hospitality Supercycle",
        headline: "Checking into luxury growth.",
        rationale: "ARRs (Average Room Rates) are holding up. New brands (Ginger, Vivanta) are scaling via management contracts (asset light).",
        date: "Jan 23, 2026"
    },
    {
        id: 124,
        symbol: "FEDERALBNK",
        verdict: "BUY" as VerdictType,
        catalyst: "Fintech Partnerships",
        headline: "The preferred partner for fintechs.",
        rationale: "Best in class liability franchise among mid-sized banks. Potential candidate for M&A in the long run. Steady 15% compounder.",
        date: "Jan 24, 2026"
    },
    {
        id: 125,
        symbol: "MPHASIS",
        verdict: "HOLD" as VerdictType,
        catalyst: "US Mortgage Recovery",
        headline: "Waiting for the US BFSI pivot.",
        rationale: "High exposure to US mortgage/banking needs interest rates to fall. Until then, growth will remain muted.",
        date: "Jan 23, 2026"
    },
    {
        id: 126,
        symbol: "TATACOMM",
        verdict: "BUY" as VerdictType,
        catalyst: "Digital Transformation",
        headline: "Backbone of the digital economy.",
        rationale: "Shift from voice to data is complete. Cloud / Edge computing services are the new growth engines. Margin expansion visibility is high.",
        date: "Jan 24, 2026"
    },
    {
        id: 127,
        symbol: "PHOENIXLTD",
        verdict: "BUY" as VerdictType,
        catalyst: "Consumption Boom",
        headline: "India's mall king.",
        rationale: "Retail consumption is robust. New mall launches in Indore/Ahmedabad will drive rental income. A proxy for urban consumption.",
        date: "Jan 23, 2026"
    },
    {
        id: 128,
        symbol: "MAXHEALTH",
        verdict: "BUY" as VerdictType,
        catalyst: "bed Capacity Addition",
        headline: "Premium healthcare play.",
        rationale: "Highest ARPOB (Average Revenue Per Occupied Bed) in the industry. Aggressive expansion in NCR and Mumbai. Structural winner.",
        date: "Jan 24, 2026"
    },
    {
        id: 129,
        symbol: "NAUKRI",
        verdict: "BUY" as VerdictType,
        catalyst: "IT Hiring Revival",
        headline: "Monopoly in jobs, bet on new-age tech.",
        rationale: "Core jobs business is a cash cow. Valuation is supported by holdings in Zomato/PolicyBazaar. Any uptick in IT hiring will trigger a rally.",
        date: "Jan 23, 2026"
    },
    {
        id: 130,
        symbol: "LALPATHLAB",
        verdict: "HOLD" as VerdictType,
        catalyst: "Competition Pricing",
        headline: "Quality checks out, growth checks pending.",
        rationale: "Price war from 1mg/Tata is stabilizing. Volume growth is key. Premium valuation limits upside for now.",
        date: "Jan 24, 2026"
    },
    {
        id: 131,
        symbol: "KAJARIACER",
        verdict: "BUY" as VerdictType,
        catalyst: "Real Estate Revival",
        headline: "Flooring the competition.",
        rationale: "Market leader in tiles. Real estate upcycle is a direct tailwind. Capacity expansion is timely.",
        date: "Jan 24, 2026"
    },
    {
        id: 132,
        symbol: "CROMPTON",
        verdict: "HOLD" as VerdictType,
        catalyst: "Butterfly Gandhimathi Merger",
        headline: "Integration pains, long term gains.",
        rationale: "Merger with Butterfly is strategic but execution risks remain. Core fans/lighting business is steady.",
        date: "Jan 23, 2026"
    },
    {
        id: 133,
        symbol: "TIINDIA",
        verdict: "BUY" as VerdictType,
        catalyst: "EV & Engineering Growth",
        headline: "Tube Investments is a compounding machine.",
        rationale: "Diversified engineering play. EV three-wheeler foray is promising. Strong capital allocation track record.",
        date: "Jan 25, 2026"
    },
    {
        id: 134,
        symbol: "DALBHARAT",
        verdict: "BUY" as VerdictType,
        catalyst: "Regional Expansion",
        headline: "Cementing a pan-India presence.",
        rationale: "Aggressive capacity expansion to 75MTPA. Cost leader in the industry. Valuation is attractive compared to peers.",
        date: "Jan 24, 2026"
    },
    {
        id: 135,
        symbol: "FLUOROCHEM",
        verdict: "BUY" as VerdictType,
        catalyst: "EV Battery Chemicals",
        headline: "Fluoropolymers are the new gold.",
        rationale: "Only player in PVDF (battery chemical) in India. High entry barriers. Massive capex tailwind.",
        date: "Jan 25, 2026"
    },
    {
        id: 136,
        symbol: "COROMANDEL",
        verdict: "BUY" as VerdictType,
        catalyst: "Nano DAP Adoption",
        headline: "Fertile ground for growth.",
        rationale: "Backward integration in phosphoric acid is a competitive advantage. Nano DAP launch is a game changer for margins.",
        date: "Jan 23, 2026"
    },
    {
        id: 137,
        symbol: "GLENMARK",
        verdict: "HOLD" as VerdictType,
        catalyst: "Debt Reduction",
        headline: "Deleveraging is a positive sign.",
        rationale: "Sale of Glenmark Life Sciences stake helps reduce debt. US generic pricing pressure persists.",
        date: "Jan 24, 2026"
    },
    {
        id: 138,
        symbol: "EXIDEIND",
        verdict: "BUY" as VerdictType,
        catalyst: "Li-ion Gigafactory",
        headline: "Charging up for the EV transition.",
        rationale: "First mover advantage in Li-ion cell manufacturing in India. Order book from OEMs is building up.",
        date: "Jan 25, 2026"
    },
    {
        id: 139,
        symbol: "IPCALAB",
        verdict: "BUY" as VerdictType,
        catalyst: "Domestic Formulation Growth",
        headline: "Resilient domestic portfolio.",
        rationale: "Strong brand recall in pain management (Zerodol). Exports are recovering after FDA clearance.",
        date: "Jan 23, 2026"
    },
    {
        id: 140,
        symbol: "MFSL",
        verdict: "BUY" as VerdictType,
        catalyst: "Axis Bank Partnership",
        headline: "Max Financial looks max attractive.",
        rationale: "Uncertainty around Axis Bank deal is over. Focus shifts back to business growth. Valuation discount should narrow.",
        date: "Jan 24, 2026"
    },
    {
        id: 141,
        symbol: "STARHEALTH",
        verdict: "WAIT" as VerdictType,
        catalyst: "Combined Ratio Improvement",
        headline: "Market leader but claims ratio hurts.",
        rationale: "Dominant market share in retail health. However, frequent price hikes are needed to offset medical inflation.",
        date: "Jan 23, 2026"
    },
    {
        id: 142,
        symbol: "EMAMILTD",
        verdict: "WAIT" as VerdictType,
        catalyst: "Rural Recovery",
        headline: "Waiting for winter (sales).",
        rationale: "Heavily dependent on seasonal products and rural demand. Growth has been sluggish for years.",
        date: "Jan 24, 2026"
    },
    {
        id: 143,
        symbol: "ISEC",
        verdict: "HOLD" as VerdictType,
        catalyst: "Delisting Drama",
        headline: "Merger with ICICI Bank is the only trigger.",
        rationale: "Cyclical business dependent on market volumes. Merger ratio is set, so upside is capped.",
        date: "Jan 23, 2026"
    },
    {
        id: 144,
        symbol: "NATIONALUM",
        verdict: "BUY" as VerdictType,
        catalyst: "Alumina Prices",
        headline: "NALCO is shining.",
        rationale: "Lowest cost producer of Bauxite/Alumina globally. Rising commodity prices directly flow to bottom line. High dividend yield.",
        date: "Jan 25, 2026"
    },
    {
        id: 145,
        symbol: "PEL",
        verdict: "WAIT" as VerdictType,
        catalyst: "Asset Quality Stabilization",
        headline: "Transformation is painful.",
        rationale: "Shift from wholesale to retail lending involves high credit costs. wait for provisioning cycle to end.",
        date: "Jan 24, 2026"
    },
    {
        id: 146,
        symbol: "ZFCVINDIA",
        verdict: "BUY" as VerdictType,
        catalyst: "Advanced Braking Systems",
        headline: "Safety first, profits next.",
        rationale: "Mandatory rigorous safety norms for CVs is a massive tailwind. Tech leadership is unchallenged.",
        date: "Jan 25, 2026"
    },
    {
        id: 147,
        symbol: "AIAENG",
        verdict: "BUY" as VerdictType,
        catalyst: "Mining Capex",
        headline: "Grinding out consistent growth.",
        rationale: "Niche global leader in grinding media. Recurring revenue model. Debt free and cash rich.",
        date: "Jan 23, 2026"
    },
    {
        id: 148,
        symbol: "RADICO",
        verdict: "BUY" as VerdictType,
        catalyst: "Premium Spirits Growth",
        headline: "Cheers to premiumization.",
        rationale: "Rampur and Jaisalmer brands are winning globally. Margin expansion from premium mix is visible.",
        date: "Jan 25, 2026"
    },
    {
        id: 149,
        symbol: "SONACOMS",
        verdict: "BUY" as VerdictType,
        catalyst: "EV Order Book",
        headline: "Tech-agnostic auto supplier.",
        rationale: "Global leader in differential gears. Huge EV order book ensures future proof growth.",
        date: "Jan 24, 2026"
    },
    {
        id: 150,
        symbol: "ATUL",
        verdict: "HOLD" as VerdictType,
        catalyst: "Agrochem Recovery",
        headline: "Conservative management, cyclical headwinds.",
        rationale: "Ideally managed company facing sectoral downturn in crop protection. Accumulate slowly.",
        date: "Jan 23, 2026"
    },
    {
        id: 151,
        symbol: "KPRMILL",
        verdict: "BUY" as VerdictType,
        catalyst: "Garment Export Demand",
        headline: "Spinning a success story.",
        rationale: "Vertical integration from yarn to ethanol. ethanol capacity expansion is a kicker.",
        date: "Jan 25, 2026"
    },
    {
        id: 152,
        symbol: "WHIRLPOOL",
        verdict: "WAIT" as VerdictType,
        catalyst: "Market Share Recovery",
        headline: "Needs to spin faster.",
        rationale: "Lost market share to LG/Samsung. New management needs to prove execution capability.",
        date: "Jan 24, 2026"
    },
    {
        id: 153,
        symbol: "BATAINDIA",
        verdict: "HOLD" as VerdictType,
        catalyst: "Premium Store Rollout",
        headline: "Trying to be cool again.",
        rationale: "Premiumization strategy is slow. Mass market demand is weak. Dividend is the only comfort.",
        date: "Jan 23, 2026"
    },
    {
        id: 154,
        symbol: "SKFINDIA",
        verdict: "BUY" as VerdictType,
        catalyst: "Railway & Wind Energy Orders",
        headline: "Bearing the load of growth.",
        rationale: "Industrial recovery play. Localization of high-margin bearings improves profitability.",
        date: "Jan 25, 2026"
    },
    {
        id: 155,
        symbol: "TIMKEN",
        verdict: "BUY" as VerdictType,
        catalyst: "Vande Bharat Orders",
        headline: "Rolling with the railways.",
        rationale: "Key beneficiary of railway modernization. Parent company support adds tech edge.",
        date: "Jan 24, 2026"
    },
    {
        id: 156,
        symbol: "TATAINVEST",
        verdict: "HOLD" as VerdictType,
        catalyst: "Tata Group IPOs",
        headline: "Holding company play.",
        rationale: "Run up has been sharp ahead of Tata Technologies IPO. Valuation is now rich.",
        date: "Jan 23, 2026"
    },
    {
        id: 157,
        symbol: "CHOLAFIN",
        verdict: "BUY" as VerdictType,
        catalyst: "Diversified Lending",
        headline: "Best managed NBFC.",
        rationale: "Expansion into SME and housing finance reduces vehicle cyclicity. A consistent compounder.",
        date: "Jan 25, 2026"
    },
    {
        id: 158,
        symbol: "TORNTPOWER",
        verdict: "BUY" as VerdictType,
        catalyst: "Merchant Power Rates",
        headline: "Efficient utility player.",
        rationale: "Distribution franchise is efficient. Merchant power capacity aids during high demand season.",
        date: "Jan 24, 2026"
    },
    {
        id: 159,
        symbol: "OBEROIRLTY",
        verdict: "BUY" as VerdictType,
        catalyst: "Thane Launch",
        headline: "Entering new micro-markets.",
        rationale: "Brand commands premium. Thane entry expands addressable market significantly.",
        date: "Jan 25, 2026"
    },
    {
        id: 160,
        symbol: "AJANTPHARM",
        verdict: "BUY" as VerdictType,
        catalyst: "US Generic Pricing",
        headline: "Focus pays off.",
        rationale: "High branded generic mix in Asia/Africa. US business is lean and profitable. High ROE business.",
        date: "Jan 24, 2026"
    }
];

export default function VerdictPage() {
    const [filter, setFilter] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [verdicts, setVerdicts] = useState<any[]>([]);
    // State for toggling categories
    const [activeCategory, setActiveCategory] = useState<'NIFTY50' | 'MIDCAP'>('NIFTY50');
    const [isFetchingPrices, setIsFetchingPrices] = useState(true);

    const activeDefinitions = activeCategory === 'NIFTY50' ? LARGE_CAP_VERDICTS : MID_CAP_VERDICTS;

    // Reset pagination when category changes
    useEffect(() => {
        setVisibleCount(6);
        setFilter('');
        setVerdicts([]);
        setIsFetchingPrices(true);
    }, [activeCategory]);

    useEffect(() => {
        const fetchLivePrices = async () => {
            setIsFetchingPrices(true);
            try {
                // Get all symbols from definitions and ensure they have .NS suffix for Indian market
                const symbols = activeDefinitions.map(v => v.symbol.endsWith('.NS') ? v.symbol : `${v.symbol}.NS`);

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
                const priceMap = new Map();
                liveData.forEach((s: any) => {
                    priceMap.set(s.symbol, s); // e.g. TCS.NS
                    const shortSymbol = s.symbol.replace('.NS', '');
                    priceMap.set(shortSymbol, s); // e.g. TCS
                });

                const mergedData = activeDefinitions.map(def => {
                    const stock = priceMap.get(def.symbol); // Should work with short symbol now

                    return {
                        ...def,
                        companyName: stock?.companyName || def.symbol,
                        price: stock?.currentPrice || 0,
                        change: (stock?.changePercent / 100) * stock?.currentPrice || 0,
                        changePercent: stock?.changePercent || 0,
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
                setVerdicts(activeDefinitions.map(v => ({ ...v, price: 0, change: 0, changePercent: 0 })));
            } finally {
                setIsFetchingPrices(false);
            }
        };

        fetchLivePrices();
    }, [activeCategory]); // Re-run when category changes

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
            <div className="container max-w-7xl mx-auto px-4 py-8">

                {/* Main Content */}
                <div className="w-full">
                    <PremiumGuard>
                        <div className="flex flex-col gap-6">

                            {/* Header Section */}
                            <div className="flex flex-col gap-4 border-b pb-8 bg-card/30 p-6 rounded-2xl">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-sm">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Premium Intelligence</span>
                                    </div>

                                    {/* --- CATEGORY TOGGLE --- */}
                                    <div className="flex items-center p-1 bg-muted/40 rounded-full border border-border/40">
                                        <button
                                            onClick={() => setActiveCategory('NIFTY50')}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                                                activeCategory === 'NIFTY50'
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            NIFTY 50
                                        </button>
                                        <button
                                            onClick={() => setActiveCategory('MIDCAP')}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                                                activeCategory === 'MIDCAP'
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            NIFTY MIDCAP 100
                                        </button>
                                    </div>
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
                                            placeholder={`Search ${activeCategory === 'NIFTY50' ? 'Nifty 50' : 'Midcap'} Verdicts...`}
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
                                                Load More {activeCategory === 'NIFTY50' ? 'Nifty 50' : 'Midcap'} Data
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
                                    <p>No verdicts found for "{filter}" in {activeCategory === 'NIFTY50' ? 'Nifty 50' : 'Midcap'}</p>
                                    <Button variant="link" onClick={() => setFilter('')} className="mt-2 text-primary">
                                        Clear Search
                                    </Button>
                                </div>
                            )}
                        </div>
                    </PremiumGuard>
                </div>
            </div>
        </div>
    );
}
