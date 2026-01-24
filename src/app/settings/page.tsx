"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { LogOut, User, Moon, Sun, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (!user) {
        // Redirect or show generic
        return (
            <div className="min-h-screen bg-background pt-20 px-4 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Please log in to view settings.</p>
                <Button onClick={() => router.push("/login")}>Log In</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container max-w-md mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                <div className="space-y-6">
                    {/* Account Section */}
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
                        <Card className="bg-card border-none shadow-sm overflow-hidden">
                            <div className="p-4 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                                    <img src={user.avatarUrl || "https://github.com/shadcn.png"} alt={user.handle} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="text-muted-foreground" />
                                </Button>
                            </div>
                        </Card>
                    </section>

                    {/* Appearance */}
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h2>
                        <Card className="bg-card border-none shadow-sm">
                            <div className="p-0">
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                                        <span>Dark Mode</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground capitalize">{theme}</span>
                                </button>
                            </div>
                        </Card>
                    </section>

                    {/* Actions */}
                    <section className="space-y-3">
                        <Button
                            variant="destructive"
                            className="w-full justify-start h-12 text-base"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Log Out
                        </Button>
                    </section>

                    <div className="pt-8 text-center text-xs text-muted-foreground">
                        <p>StockX for Mobile v1.0.0</p>
                        <p>© 2026 StockX Inc.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
