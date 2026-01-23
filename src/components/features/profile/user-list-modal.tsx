
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "@/lib/config";

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    type: "followers" | "following";
}

export function UserListModal({ isOpen, onClose, userId, type }: UserListModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}/${type}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="capitalize">{type}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md p-4">
                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground">Loading...</div>
                    ) : users.length > 0 ? (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Link href={`/u/${user.handle}`} onClick={onClose}>
                                        <Avatar className="h-10 w-10 border border-slate-200 hover:opacity-80 transition-opacity">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback>{user.firstName?.[0] || user.handle?.[0]}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 overflow-hidden">
                                        <Link href={`/u/${user.handle}`} onClick={onClose} className="block truncate font-medium hover:underline">
                                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.handle}
                                        </Link>
                                        <p className="text-xs text-muted-foreground truncate">@{user.handle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            No {type} found.
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
