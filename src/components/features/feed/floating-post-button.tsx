import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreatePost } from "@/components/features/feed/create-post";

export function FloatingPostButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white z-40 flex items-center justify-center p-0 transition-transform active:scale-95"
                    size="icon"
                >
                    <Plus size={28} strokeWidth={2.5} />
                </Button>
            </DialogTrigger>
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
