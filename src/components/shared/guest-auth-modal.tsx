"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GuestAuthModal() {
    const { user, isLoading, showLoginModal, setShowLoginModal } = useAuth();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");

    // Track if we've already auto-triggered the login modal to prevent loops
    const hasTriggeredRef = useRef(false);

    // Sync local open state with global context state
    useEffect(() => {
        setOpen(showLoginModal);
    }, [showLoginModal]);

    // Mandatory Login Trigger for Unauthenticated Users
    useEffect(() => {
        if (!isLoading && !user && !showLoginModal && !hasTriggeredRef.current) {
            // Small delay to allow initial load/hydration stability
            const timer = setTimeout(() => {
                setShowLoginModal(true);
                hasTriggeredRef.current = true;
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, user, showLoginModal, setShowLoginModal]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        setShowLoginModal(newOpen);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    const handleEmailLogin = async () => {
        try {
            setError("");
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("accessToken", data.access_token);
                window.location.reload(); // Refresh to load user
            } else {
                setError("Invalid credentials");
            }
        } catch (e) {
            setError("Login failed");
        }
    };

    const handleRegister = async () => {
        try {
            setError("");
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });
            if (res.ok) {
                // Auto login after register
                await handleEmailLogin();
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || "Registration failed (User exists?)");
            }
        } catch (e) {
            setError("Registration failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="space-y-4 text-center pb-6">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="mx-auto bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-2xl w-fit shadow-inner ring-1 ring-primary/20"
                        >
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </motion.div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Welcome to StockX
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground/80">
                                Join India's fastest growing investment community
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">Login</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">Sign Up</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="login" className="space-y-4 focus-visible:outline-none">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium ml-1">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium ml-1">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-500 text-center font-medium bg-red-500/10 py-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                    <Button className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleEmailLogin}>
                                        Sign In
                                    </Button>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="register" className="space-y-4 focus-visible:outline-none">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first" className="text-sm font-medium ml-1">First name</Label>
                                            <Input
                                                id="first"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={e => setFirstName(e.target.value)}
                                                className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last" className="text-sm font-medium ml-1">Last name</Label>
                                            <Input
                                                id="last"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={e => setLastName(e.target.value)}
                                                className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email-reg" className="text-sm font-medium ml-1">Email</Label>
                                        <Input
                                            id="email-reg"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pass-reg" className="text-sm font-medium ml-1">Password</Label>
                                        <Input
                                            id="pass-reg"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-500 text-center font-medium bg-red-500/10 py-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                    <Button className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleRegister}>
                                        Create Account
                                    </Button>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-11 gap-3 rounded-xl border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground transition-all" onClick={handleGoogleLogin}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="font-medium">Google</span>
                    </Button>

                    <div className="mt-6 text-center">
                        <button
                            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors font-medium flex items-center justify-center gap-1 mx-auto"
                            onClick={() => handleOpenChange(false)}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
