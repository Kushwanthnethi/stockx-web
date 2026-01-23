import { SignupForm } from "@/components/features/auth/signup-form"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
    return (
        <>
            <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    Join StockX
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Start your investing journey today
                </p>
            </div>

            <div className="mt-8">
                <SignupForm />
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/90 hover:underline">
                    Log in
                </Link>
            </p>
        </>
    )
}
