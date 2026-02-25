import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form"
import { ShieldAlert } from "lucide-react"

export default function ForgotPasswordPage() {
    return (
        <>
            <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    Reset Password
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter your email to receive a secure reset link
                </p>
            </div>

            <div className="mt-8">
                <ForgotPasswordForm />
            </div>
        </>
    )
}
