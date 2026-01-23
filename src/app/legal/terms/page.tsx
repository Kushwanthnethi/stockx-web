
export default function TermsPage() {
    return (
        <article className="space-y-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 23, 2026</p>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">1. Acceptance of Terms</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    By accessing and using StockX ("the Platform"), you agree to comply with and be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our services.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">2. No Financial Advice</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    StockX is a community platform for information sharing only.
                    <strong>Content generally provided on this site does not constitute financial advice.</strong>
                    We are not a SEBI registered investment advisor. Users should conduct their own due diligence
                    before making any investment decisions.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">3. User Conduct</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    Users are responsible for their posts. Harassment, spam, market manipulation attempts,
                    and sharing false information are strictly prohibited and may result in account termination.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">4. Disclaimer of Warranties</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    The Platform is provided "as is" without warranties of any kind.
                    We verify data to the best of our ability but do not guarantee the accuracy of stock prices
                    or market data provided by third-party APIs.
                </p>
            </section>
        </article>
    );
}
