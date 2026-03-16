
export default function CookiesPage() {
    return (
        <article className="space-y-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: March 16, 2026</p>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">1. What Are Cookies?</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    Cookies are small text files that are stored on your device when you visit a website.
                    They help us improve your experience by remembering your preferences and keeping you logged in.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">2. How We Use Cookies</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    StocksX uses cookies for:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><strong>Authentication:</strong> To keep you securely logged in across sessions.</li>
                    <li><strong>Preferences:</strong> To remember your chosen theme (Dark/Light mode), recent stock searches, and watchlist state.</li>
                    <li><strong>Feature State:</strong> To persist your Portfolio tracker view, Strategist analysis history, and notification settings between visits.</li>
                    <li><strong>Analytics:</strong> To understand aggregate usage patterns and improve the Platform. Analytics data is anonymised and not linked to individual users.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">3. Types of Cookies We Use</h2>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><strong>Essential Cookies:</strong> Required for the Platform to function. These cannot be disabled without breaking core features such as login and navigation.</li>
                    <li><strong>Preference Cookies:</strong> Store your UI settings (e.g., dark/light mode) so they persist across visits.</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how users navigate StocksX so we can improve the experience. No personally identifiable information is collected.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">4. Managing Cookies</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies.
                    Please note that disabling essential cookies will prevent you from logging in and using personalised features of the Platform,
                    such as the Portfolio tracker, Watchlist, and Strategist history.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">5. Changes to This Policy</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We may update this Cookie Policy as we introduce new Platform features. Changes will be reflected by updating the
                    "Last Updated" date at the top of this page. We encourage you to review this page periodically.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">6. Contact Us</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    For questions about cookies or tracking technologies used on StocksX, contact us at{" "}
                    <a href="mailto:contact@stocksx.info" className="underline">contact@stocksx.info</a>.
                </p>
            </section>
        </article>
    );
}
