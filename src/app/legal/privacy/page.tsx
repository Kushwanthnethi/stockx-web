
export default function PrivacyPage() {
    return (
        <article className="space-y-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: March 16, 2026</p>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">1. Information We Collect</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We collect information you provide directly to us, including when you create an account,
                    edit your profile, post content, or use any of our platform features. This includes:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><strong>Account Information:</strong> Your name, email address, username (handle), and profile picture.</li>
                    <li><strong>Portfolio Data:</strong> Stock holdings, quantities, average buy prices, and transaction history you manually enter into the Portfolio tracker.</li>
                    <li><strong>Watchlist Data:</strong> Stocks you add to your personal watchlist.</li>
                    <li><strong>Activity Data:</strong> Posts, comments, bookmarks, likes, and other content you create or interact with on the feed.</li>
                    <li><strong>Notification Preferences:</strong> Your choices about which alerts and notifications you wish to receive.</li>
                    <li><strong>Usage Data:</strong> Pages you visit, features you use (e.g., Strategist AI, Verdict, Result Corner), and how you interact with the platform.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">2. How We Use Your Data</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We use your data to:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>Provide, maintain, and improve all platform features including the feed, Portfolio tracker, Stock of the Week, Verdict, Strategist, and Result Corner.</li>
                    <li>Personalize your feed, recommendations, and AI-powered analyses.</li>
                    <li>Deliver notifications and alerts relevant to your watchlist and preferences.</li>
                    <li>Send you technical notices, security updates, and support messages.</li>
                    <li>Enforce our Terms of Service and maintain a safe community environment.</li>
                    <li>Generate anonymised, aggregated usage insights to improve the platform.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">3. AI Features & Your Data</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    Features such as <strong>Strategist</strong> (AI-powered stock analysis) and <strong>Verdict</strong> (BUY / HOLD / SELL signals) use
                    publicly available market data and technical indicators — not your personal portfolio or holdings — to generate insights.
                    Queries you submit to Strategist may be logged to improve response quality. These logs are anonymised and are not linked to
                    identifiable personal information.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">4. How We Share Your Data</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We do not sell your personal information. We may share data only in the following circumstances:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><strong>Service Providers:</strong> Trusted third-party services that help us operate the platform (e.g., authentication, hosting, analytics) under strict data processing agreements.</li>
                    <li><strong>Legal Obligations:</strong> When required by applicable law or a valid governmental order.</li>
                    <li><strong>Safety:</strong> To protect the rights, property, or safety of StocksX, our users, or the public.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">5. Data Retention</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We retain your account information and content for as long as your account is active. Portfolio and watchlist data
                    are deleted within 30 days of account deletion. You may request deletion of your data at any time by contacting us.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">6. Data Security</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We implement industry-standard security measures — including encrypted data transmission (HTTPS), hashed passwords,
                    and access controls — to protect your personal information. However, no method of transmission over the Internet
                    is 100% secure, and we cannot guarantee absolute security.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">7. Your Rights</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    You have the right to access, correct, or delete your personal data at any time through your account settings
                    or by contacting us at <a href="mailto:contact@stocksx.info" className="underline">contact@stocksx.info</a>.
                    You may also opt out of non-essential communications through the Notifications settings page.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">8. Changes to This Policy</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We may update this Privacy Policy as the platform evolves. We will notify you of significant changes via
                    the platform or email. Continued use of StocksX after changes are posted constitutes your acceptance of the updated policy.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">9. Contact Us</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    For privacy questions, account data requests, or policy concerns, contact us at{" "}
                    <a href="mailto:contact@stocksx.info" className="underline">contact@stocksx.info</a>.
                </p>
            </section>
        </article>
    );
}
