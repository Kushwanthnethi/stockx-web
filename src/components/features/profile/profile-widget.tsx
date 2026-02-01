"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, LogIn, UserPlus } from "lucide-react"
import { VerifiedBadge } from "@/components/shared/verified-badge"

export function ProfileWidget() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!user) {
        return (
            <Card className="border-border/40 shadow-md overflow-hidden bg-gradient-to-br from-card to-secondary/10">
                <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-base">New to StockX?</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Sign up now to share insights and build your investor profile.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Link href="/login">
                            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                                <LogIn className="h-3 w-3" /> Log In
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="w-full gap-2 text-xs">
                                <UserPlus className="h-3 w-3" /> Sign Up
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <Link href={`/u/${user.handle}`}>
                <div className="h-16 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-colors" />
                <CardContent className="p-4 pt-0">
                    <div className="relative -mt-8 mb-3">
                        <Avatar className="w-16 h-16 border-4 border-background shadow-md group-hover:scale-105 transition-transform">
                            <AvatarImage src={user.avatarUrl} alt={user.handle} />
                            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                {user.firstName?.[0] || user.handle[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors flex items-center gap-1">
                            {user.firstName} {user.lastName}
                            {(user.isVerified || user.verified) && <VerifiedBadge />}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">@{user.handle}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground font-medium">
                        <span>View Profile</span>
                        <div className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            →
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}
