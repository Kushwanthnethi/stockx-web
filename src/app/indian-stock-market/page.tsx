import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Indian Stock Market Analysis | NIFTY 50 & SENSEX Insights',
    description: 'Comprehensive analysis of the Indian Stock Market, featuring daily NIFTY 50 updates, SENSEX trends, and expert insights for intelligent investing.',
};

export default function IndianStockMarketPage() {
    return (
        <div className="container max-w-4xl mx-auto px-4 py-12">
            <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Indian Stock Market Analysis
                </h1>
                <p className="text-xl text-muted-foreground">
                    Deep dive into data-driven insights for smarter investing.
                </p>
            </header>

            <article className="prose dark:prose-invert lg:prose-xl mx-auto space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-3">Understanding the Indian Market Landscape</h2>
                    <p>
                        The Indian stock market represents one of the most dynamic and fastest-growing financial ecosystems in the world.
                        Anchored by the two primary exchanges, the <strong>National Stock Exchange (NSE)</strong> and the <strong>Bombay Stock Exchange (BSE)</strong>,
                        it offers a diverse range of investment opportunities across sectors like IT, Banking, Pharmaceuticals, and renewable energy.
                    </p>
                    <p>
                        Whether you are tracking the <em className="text-blue-500">NIFTY 50</em> benchmarks or exploring high-growth small-cap indices,
                        having access to real-time data and analytical tools is crucial for making informed decisions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Key Drivers of Market Trends</h2>
                    <p>
                        Several factors influence the daily movements of the Indian equity markets. Global economic indicators,
                        domestic fiscal policies, corporate earnings reports, and foreign institutional investor (FII) flows all play
                        a significant role in shaping market sentiment.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Macroeconomic Data:</strong> key metrics such as GDP growth, inflation rates (CPI/WPI), and RBI monetary policy.</li>
                        <li><strong>Corporate Governance:</strong> The transparency and efficiency of company management.</li>
                        <li><strong>Global Cues:</strong> Impact of US Federal Reserve policies and geopolitical events.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Why Choose StocksX for Analysis?</h2>
                    <p>
                        At <Link href="/" className="text-blue-600 hover:underline">StocksX</Link>, we leverage advanced algorithms and real-time data processing
                        to provide you with actionable insights. Our platform goes beyond simple price tracking to offer:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Detailed financial health checks for listed companies.</li>
                        <li>Sentiment analysis based on management commentary and news.</li>
                        <li>Interactive charts and peer comparison tools.</li>
                    </ul>
                </section>

                <div className="mt-12 p-6 bg-card border rounded-xl">
                    <h3 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h3>
                    <p className="mb-4 text-muted-foreground">
                        Explore our comprehensive dashboard to see live market data and start analyzing your favorite stocks today.
                    </p>
                    <Link href="/">
                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                            View Market Dashboard
                        </button>
                    </Link>
                </div>
            </article>
        </div>
    );
}
