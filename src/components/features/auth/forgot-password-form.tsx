"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [step, setStep] = React.useState<1 | 2>(1)
    const [email, setEmail] = React.useState<string>("")
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

    async function onSendOtp(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep(2)
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || 'Failed to send OTP. Please check your email.');
            }
        } catch (error) {
            console.error(error);
            alert('A network error occurred');
        } finally {
            setIsLoading(false)
        }
    }

    async function onResetPassword(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as typeof event.target & {
            otp: { value: string };
            password: { value: string };
        };
        const otp = target.otp.value;
        const password = target.password.value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });

            if (res.ok) {
                setSuccessMessage("Your password has been successfully reset! You can now sign in.");
                setStep(1);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || 'Failed to reset password. Check your OTP and password requirements.');
            }
        } catch (error) {
            console.error(error);
            alert('A network error occurred');
        } finally {
            setIsLoading(false)
        }
    }

    if (successMessage) {
        return (
            <div className={cn("grid gap-6 text-center", className)}>
                <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900">
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
                <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">Back to Sign In</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className={cn("grid gap-6", className)}>
            {step === 1 ? (
                <form onSubmit={onSendOtp}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Your Account Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button disabled={isLoading || !email}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Reset Code
                        </Button>
                        <Link href="/login" className="mt-4 text-center">
                            <Button variant="ghost" type="button" className="text-muted-foreground gap-2 w-full">
                                <ArrowLeft className="h-4 w-4" /> Back to System Log In
                            </Button>
                        </Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={onResetPassword}>
                    <div className="grid gap-4">
                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                            A reset code was sent to <strong className="text-foreground">{email}</strong>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">6-Digit OTP</Label>
                            <Input
                                id="otp"
                                placeholder="123456"
                                type="text"
                                inputMode="numeric"
                                pattern="\d{6}"
                                maxLength={6}
                                required
                                disabled={isLoading}
                                className="text-center tracking-[0.5em] font-mono"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                            </p>
                        </div>
                        <Button disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
                        </Button>
                        <Button variant="ghost" type="button" disabled={isLoading} onClick={() => setStep(1)} className="text-muted-foreground mt-2">
                            Use a different email address
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
