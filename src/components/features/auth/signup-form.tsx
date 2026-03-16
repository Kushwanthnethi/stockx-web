"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export function SignupForm({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [otpSent, setOtpSent] = React.useState<boolean>(false)
    const [otp, setOtp] = React.useState<string>('')

    const [timeLeft, setTimeLeft] = React.useState<number>(120);

    React.useEffect(() => {
        if (otpSent && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [otpSent, timeLeft]);

    // Form state
    const [name, setName] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [requestOtpError, setRequestOtpError] = React.useState<string>('');

    const router = useRouter()

    async function handleRequestOtp(event?: React.SyntheticEvent) {
        if (event) event.preventDefault()
        setRequestOtpError('')

        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!PASSWORD_REGEX.test(password)) {
            alert("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character");
            return;
        }

        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setOtpSent(true);
                setTimeLeft(120); // Reset timer on new request
            } else {
                const data = await res.json().catch(() => ({}));
                setRequestOtpError(data.message || "Failed to send OTP");
            }
        } catch (e) {
            setRequestOtpError("Failed to send OTP");
        } finally {
            setIsLoading(false)
        }
    }

    async function handleRegister(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName, otp }),
            });

            if (res.ok) {
                // Auto login after register
                const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                if (loginRes.ok) {
                    const data = await loginRes.json();
                    localStorage.setItem("accessToken", data.access_token);
                    window.location.href = '/';
                }
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className={cn("grid gap-6", className)}>
            {!otpSent ? (
                <form onSubmit={handleRequestOtp}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="Rahul Kumar"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (requestOtpError) setRequestOtpError('')
                                }}
                                required
                            />
                            <p className="text-[11px] text-slate-500">Must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character</p>
                            {requestOtpError && (
                                <p className="text-[11px] text-red-500">{requestOtpError}</p>
                            )}
                        </div>

                        <div className="flex items-start gap-2 mt-2">
                            <input type="checkbox" id="terms" className="mt-1 h-3 w-3 rounded border-gray-300" required />
                            <Label htmlFor="terms" className="font-normal text-xs text-muted-foreground leading-snug">
                                I agree to the <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>, and I acknowledge that StocksX does not provide financial advice.
                            </Label>
                        </div>

                        <Button disabled={isLoading} className="mt-2 font-semibold">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Request OTP
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegister}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                placeholder=""
                                type="text"
                                disabled={isLoading}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                                required
                            />
                            <div className="text-center mt-2 space-y-2">
                                <p className="text-[11px] text-slate-500">We sent a 6-digit code to {email}</p>

                                {timeLeft > 0 ? (
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Resend code in <span className="text-foreground">{formatTime(timeLeft)}</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => handleRequestOtp(e)}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </div>

                        <Button disabled={isLoading} className="mt-2 font-semibold flex items-center justify-center">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Account
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => { setOtpSent(false); setTimeLeft(120); }} className="text-xs text-muted-foreground mt-2">
                            Back
                        </Button>
                    </div>
                </form>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button variant="outline" type="button" disabled={isLoading} className="gap-2" onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                )}
                Sign up with Google
            </Button>
        </div>
    )
}
