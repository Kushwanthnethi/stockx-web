import { SiteHeader } from "@/components/layout/site-header";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="container max-w-4xl mx-auto py-12 px-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}
