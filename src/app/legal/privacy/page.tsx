
export default function PrivacyPage() {
    return (
        <article className="space-y-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 23, 2026</p>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">1. Information We Collect</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We collect information you provide directly to us, such as when you create an account,
                    edit your profile, or post content. This includes your name, email address, and profile picture.
                </p>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">2. How We Use Your Data</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We use your data to:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Personalize your feed and recommendations.</li>
                    <li>Send you technical notices and support messages.</li>
                </ul>
            </section>

            <section>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">3. Data Security</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    We implement industry-standard security measures to protect your personal information.
                    However, no method of transmission over the Internet is 100% secure.
                </p>
            </section>
        </article>
    );
}
