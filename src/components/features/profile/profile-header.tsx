"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Link as LinkIcon, Users, Edit } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { EditProfileModal } from "./edit-profile-modal";
import { DeveloperBadge } from "@/components/shared/developer-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { UserListModal } from "./user-list-modal";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
    profile: any;
    isOwner: boolean;
    isFollowing: boolean;
    onFollowToggle: () => void;
    followLoading: boolean;
}

export function ProfileHeader({
    profile,
    isOwner,
    isFollowing,
    onFollowToggle,
    followLoading
}: ProfileHeaderProps) {
    const [listModalOpen, setListModalOpen] = useState(false);
    const [listModalType, setListModalType] = useState<"followers" | "following">("followers");

    const openFollowers = () => {
        setListModalType("followers");
        setListModalOpen(true);
    };

    const openFollowing = () => {
        setListModalType("following");
        setListModalOpen(true);
    };

    return (
        <div className="relative mb-8">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-violet-600 to-indigo-600 relative rounded-b-3xl overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-black/10" />
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 100 100" fill="white">
                        <path d="M0 0 L100 0 L100 100 Z" />
                    </svg>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4">
                <div className="relative -mt-20 flex flex-col items-start gap-4 pb-4">

                    {/* Top Row: Avatar and Actions */}
                    <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl">
                            <AvatarImage src={profile.avatarUrl} alt={profile.handle} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-muted">{profile.firstName?.[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex gap-3 mb-2">
                            {isOwner ? (
                                <EditProfileModal profile={profile} />
                            ) : (
                                <Button
                                    onClick={onFollowToggle}
                                    disabled={followLoading}
                                    className={cn(
                                        "min-w-[120px] rounded-full font-semibold shadow-lg transition-all hover:scale-105 active:scale-95",
                                        isFollowing
                                            ? "bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-4 w-full">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h1>
                                {(profile.isVerified || profile.verified) && <VerifiedBadge />}
                                <DeveloperBadge user={profile} iconSize={24} />
                            </div>
                            <p className="text-muted-foreground font-medium">@{profile.handle}</p>
                        </div>

                        {profile.bio && (
                            <p className="text-foreground/90 max-w-2xl leading-relaxed whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                            {/* Placeholder for location/website if added later */}
                            {/* <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>Mumbai, India</span>
                            </div> */}
                        </div>

                        {/* Stats - Clickable */}
                        <div className="flex items-center gap-6 pt-2">
                            <button
                                onClick={openFollowing}
                                className="flex items-center gap-1 group hover:bg-muted/50 px-2 py-1 -ml-2 rounded-lg transition-colors"
                            >
                                <span className="font-bold text-foreground text-lg">{profile._count?.following || 0}</span>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Following</span>
                            </button>
                            <button
                                onClick={openFollowers}
                                className="flex items-center gap-1 group hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors"
                            >
                                <span className="font-bold text-foreground text-lg">{profile._count?.followers || 0}</span>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Followers</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <UserListModal
                isOpen={listModalOpen}
                onClose={() => setListModalOpen(false)}
                type={listModalType}
                userId={profile.id}
            />
        </div>
    );
}
