
export default function CookiesPage() {
    return (
        <article className="space-y-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 23, 2026</p>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">1. What Are Cookies?</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    Cookies are small text files that are stored on your device when you visit a website.
                    They help us improve your experience by remembering your preferences.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">2. How We Use Cookies</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    StockX uses cookies for:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><strong>Authentication:</strong> To keep you logged in.</li>
                    <li><strong>Preferences:</strong> To remember your theme (Dark/Light mode) and recent searches.</li>
                    <li><strong>Analytics:</strong> To understand how users interact with our platform.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">3. Managing Cookies</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    You can control and manage cookies through your browser settings.
                    Please note that disabling cookies may affect certain features of the Platform.
                </p>
            </section>
        </article>
    );
}
