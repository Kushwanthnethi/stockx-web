"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, LogIn, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function SebiDisclaimerModal() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Run once on mount to check if guest should see disclaimer
        if (!isLoading && !user) {
            const hasSeen = sessionStorage.getItem("hasSeenSebiDisclaimer");
            if (!hasSeen) {
                // Show modal slightly delayed for better UX
                const timer = setTimeout(() => setOpen(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoading, user]);

    const handleAcknowledge = () => {
        sessionStorage.setItem("hasSeenSebiDisclaimer", "true");
        setOpen(false);
    };

    const handleLogin = () => {
        sessionStorage.setItem("hasSeenSebiDisclaimer", "true");
        setOpen(false);
        router.push("/login"); // Redirect to main login page instead of opening pop-up
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleAcknowledge();
        }}>
            <DialogContent className="w-[95%] max-w-[500px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl [&>button]:hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/5 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="space-y-4 text-center pb-6">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="mx-auto bg-gradient-to-br from-amber-500/20 to-amber-500/5 p-4 rounded-full w-fit shadow-inner ring-1 ring-amber-500/30"
                        >
                            <ShieldAlert className="h-8 w-8 text-amber-500" />
                        </motion.div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                                SEBI Registration Disclaimer
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed text-left">
                                StocksX is an educational platform and community for investors. <strong className="text-foreground font-semibold">We are not a SEBI registered investment advisor.</strong>
                                <br /><br />
                                The information provided here is for educational and informational purposes only and should not be construed as investment advice. Investments in securities market are subject to market risks, read all the related documents carefully before investing.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 mt-2">
                        <Button
                            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group flex items-center justify-center gap-2"
                            onClick={handleLogin}
                        >
                            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Log In / Sign Up
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl text-base font-medium border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground transition-all flex items-center justify-center gap-2"
                            onClick={handleAcknowledge}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            I Understand, Continue as Guest
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
