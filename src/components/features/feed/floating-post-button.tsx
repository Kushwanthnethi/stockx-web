"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// This component usually toggles a modal or expands inline
// For now, let's assume it scrolls to the create post area or opens a modal (if implemented)
// Or simply just creates a post if linked to a modal state.
// Since `CreatePost` is inline currently, we might need to make it a modal for the FAB to work best.
// For now, I'll make it scrollTo top where CreatePost is, OR if we want to be fancy, we open a dialog.
// Let's implement a simple scroll-to-top behavior for "New Post" if inline, or just a visual button for now.

// Actually, best UX is a modal. But let's stick to simple first.
// I will just make it a link to #create-post or trigger a focus.

export function FloatingPostButton() {
    const handleClick = () => {
        // Ideally this opens the Create Post Modal
        // For now, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Focus on input if possible?
        const input = document.querySelector('textarea[placeholder="What is happening?!"]');
        if (input instanceof HTMLElement) {
            input.focus();
        }
    };

    return (
        <Button
            onClick={handleClick}
            className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white z-40 flex items-center justify-center p-0 transition-transform active:scale-95"
            size="icon"
        >
            <Plus size={28} strokeWidth={2.5} />
        </Button>
    );
}
