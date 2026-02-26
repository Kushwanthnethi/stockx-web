import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function FeedPostSkeleton() {
    return (
        <div className="md:mb-4 mb-2 animate-pulse">
            <Card className="flex flex-row md:block border-x-0 border-t-0 border-b border-border shadow-none md:shadow-sm md:border-x md:border-t bg-background md:bg-card relative rounded-none md:rounded-xl px-3 py-3 md:p-0 gap-3 md:gap-0 w-full">
                {/* Mobile-only Left Column Avatar Skeleton */}
                <div className="md:hidden flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-muted/80" />
                </div>

                {/* Main Content Column */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <CardHeader className="flex flex-row items-start space-y-0 p-0 md:p-6 md:pb-3 md:pt-5 gap-0 md:gap-3 pr-0 md:pr-12">
                        {/* Desktop Avatar Skeleton */}
                        <div className="hidden md:block h-10 w-10 rounded-full bg-muted/80 flex-shrink-0" />

                        {/* Header Info Skeleton */}
                        <div className="flex-1 min-w-0 w-full space-y-2 py-1">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-32 bg-muted/60 rounded-md" />
                                <div className="h-3 w-20 bg-muted/40 rounded-md" />
                            </div>
                            <div className="h-3 w-16 bg-muted/30 rounded-md mt-1" />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 md:px-6 md:pb-3 pt-2 md:pt-0">
                        {/* Text Lines Skeleton */}
                        <div className="space-y-2.5">
                            <div className="h-4 w-full bg-muted/50 rounded-md" />
                            <div className="h-4 w-[90%] bg-muted/50 rounded-md" />
                            <div className="h-4 w-[60%] bg-muted/50 rounded-md" />
                        </div>

                        {/* Optional Image Skeleton Placeholder (we can assume ~30% of posts have an image to make it look dynamic if we wanted, but standard text is better) */}
                        <div className="mt-4 flex gap-2">
                            <div className="h-5 w-16 bg-muted/40 rounded-full" />
                            <div className="h-5 w-16 bg-muted/40 rounded-full" />
                        </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-4 md:px-6 md:pt-3 md:pb-4 flex items-center justify-between max-w-md">
                        {/* Action Buttons Skeleton */}
                        <div className="h-6 w-10 bg-muted/40 rounded-md" />
                        <div className="h-6 w-10 bg-muted/40 rounded-md" />
                        <div className="h-6 w-10 bg-muted/40 rounded-md" />
                        <div className="h-6 w-10 bg-muted/40 rounded-md" />
                        <div className="h-6 w-10 bg-muted/40 rounded-md" />
                    </CardFooter>
                </div>
            </Card>
        </div>
    );
}
