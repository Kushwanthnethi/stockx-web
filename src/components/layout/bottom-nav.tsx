"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Target, Sparkles, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const CreatePost = dynamic(() => import("@/components/features/feed/create-post").then(mod => mod.CreatePost), { ssr: false });
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export function BottomNav() {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);
    const { user, setShowLoginModal } = useAuth();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    // Hide on auth pages
    if (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") return null;

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Target", href: "/stock-of-the-week", icon: Target },
        { label: "Create", href: "#create", icon: Plus, special: true }, // href is dummy now
        { label: "Strategist", href: "/strategist", icon: Sparkles },
        { label: "Portfolio", href: "/portfolio", icon: Briefcase },
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
            <div className="md:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex justify-center pointer-events-none">
                <nav className="pointer-events-auto flex items-center justify-around px-2 h-14 rounded-full w-full max-w-sm bg-black/95 backdrop-blur-xl border border-white/5 shadow-2xl">
                    {navItems.map((item) => {
                        const active = isActive(item.href);

                        if (item.special) {
                            return (
                                <div key={item.label} className="flex h-full items-center justify-center">
                                    <button
                                        onClick={handleCreateClick}
                                        className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-md transform active:scale-95 transition-transform"
                                    >
                                        <item.icon size={22} strokeWidth={2.5} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-12 h-full relative group",
                                    active ? "text-white" : "text-white/50 hover:text-white/80"
                                )}
                            >
                                <item.icon
                                    size={22}
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
