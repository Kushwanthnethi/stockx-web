"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Gavel, Target, Megaphone } from "lucide-react"; // Updated icons for new layout
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreatePost } from "@/components/features/feed/create-post";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export function BottomNav() {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);
    const { user, setShowLoginModal } = useAuth();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    // Hide on auth pages
    if (pathname === "/login" || pathname === "/signup") return null;

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Stock of Week", href: "/stock-of-the-week", icon: Target },
        { label: "Create", href: "#create", icon: PlusCircle, special: true }, // href is dummy now
        { label: "Verdict", href: "/verdict", icon: Gavel },
        { label: "Results", href: "/results", icon: Megaphone },
    ];

    const handleCreateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            if (setShowLoginModal) {
                setShowLoginModal(true);
            } else {
                router.push("/login");
            }
            return;
        }
        setOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
                {/* 
                   Updated Glass Dock Style:
                   - Stronger, darker background (bg-background/95) to prevent text bleed-through.
                   - Higher backdrop blur (backdrop-blur-xl).
                   - Slight border/shadow tweaks for "pop".
                */}
                <nav className="pointer-events-auto flex items-center justify-around px-2 h-16 rounded-2xl w-full max-w-sm bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl dark:shadow-black/50 dark:bg-[#0a0a0a]/95">
                    {navItems.map((item) => {
                        const active = isActive(item.href);

                        if (item.special) {
                            return (
                                <div key={item.label} className="-mt-6">
                                    <button
                                        onClick={handleCreateClick}
                                        className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform active:scale-95 transition-transform border-4 border-background"
                                    >
                                        <item.icon size={28} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-full relative group",
                                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute -top-3 h-1 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    size={24}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={cn("transition-all duration-300", active && "scale-110 drop-shadow-md")}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                <div className="bg-background rounded-xl overflow-hidden border border-border shadow-xl">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-center">New Post</h3>
                    </div>
                    <CreatePost onPostCreated={() => setOpen(false)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
