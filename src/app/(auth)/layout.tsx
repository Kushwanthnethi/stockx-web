export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 md:py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm space-y-8">
                {children}
            </div>
        </div>
    )
}
