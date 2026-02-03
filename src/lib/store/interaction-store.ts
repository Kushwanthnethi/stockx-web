import React from 'react';
import { create } from 'zustand';
import { API_BASE_URL } from '@/lib/config';

interface PostState {
    isLiked: boolean;
    likeCount: number;
    isBookmarked: boolean;
    reshareCount: number;
    // We can add comment count if we want to sync that too
    commentCount?: number;
}

interface UserState {
    isFollowing: boolean;
    isBlocked: boolean;
}

interface InteractionStore {
    // State Maps
    posts: Record<string, PostState>;
    users: Record<string, UserState>;

    // Actions
    toggleLike: (postId: string, current: boolean, currentCount: number) => Promise<void>;
    toggleBookmark: (postId: string, current: boolean) => Promise<void>;
    toggleReshare: (postId: string, currentCount: number) => Promise<void>;
    toggleFollow: (userId: string, current: boolean) => Promise<void>;
    toggleBlock: (userId: string) => Promise<void>;

    // Initializers (to hydrate from props without overwriting valid newer state)
    initPost: (postId: string, state: Partial<PostState>) => void;
    initUser: (userId: string, state: Partial<UserState>) => void;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
    posts: {},
    users: {},

    toggleLike: async (postId, current, currentCount) => {
        // Optimistic Update
        const nextState = !current;
        const nextCount = nextState ? currentCount + 1 : currentCount - 1;

        set((state) => ({
            posts: {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    isLiked: nextState,
                    likeCount: nextCount
                }
            }
        }));

        const token = localStorage.getItem('accessToken');
        if (!token) return; // Hook caller handles redirect usually, or we can't do anything

        try {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to like');
        } catch (e) {
            console.error(e);
            // Revert
            set((state) => ({
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...state.posts[postId],
                        isLiked: current,
                        likeCount: currentCount
                    }
                }
            }));
        }
    },

    toggleBookmark: async (postId, current) => {
        const nextState = !current;
        set((state) => ({
            posts: {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    isBookmarked: nextState
                }
            }
        }));

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/posts/${postId}/bookmark`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error(e);
            // Revert
            set((state) => ({
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...state.posts[postId],
                        isBookmarked: current
                    }
                }
            }));
        }
    },

    toggleReshare: async (postId, currentCount) => {
        // Optimistic
        set((state) => ({
            posts: {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    reshareCount: currentCount + 1
                }
            }
        }));

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/posts/${postId}/reshare`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error(e);
            // Revert
            set((state) => ({
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...state.posts[postId],
                        reshareCount: currentCount
                    }
                }
            }));
        }
    },

    toggleFollow: async (userId, current) => {
        const nextState = !current;
        console.log(`[InteractionStore] Toggling Follow for ${userId}: ${current} -> ${nextState}`);

        set((state) => ({
            users: {
                ...state.users,
                [userId]: {
                    ...state.users[userId],
                    isFollowing: nextState
                }
            }
        }));

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const endpoint = nextState ? 'follow' : 'unfollow';
            const res = await fetch(`${API_BASE_URL}/users/${userId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Failed to ${endpoint}`);
        } catch (e) {
            console.error(e);
            // Revert
            set((state) => ({
                users: {
                    ...state.users,
                    [userId]: {
                        ...state.users[userId],
                        isFollowing: current
                    }
                }
            }));
        }
    },

    toggleBlock: async (userId) => {
        set((state) => ({
            users: {
                ...state.users,
                [userId]: { ...state.users[userId], isBlocked: true }
            }
        }));

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/users/${userId}/block`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error(e);
            // Revert? Usually block implies removing from feed, so revert is hard visually.
        }
    },

    initPost: (postId, initialState) => {
        const current = get().posts[postId];
        if (!current) {
            set((state) => ({
                posts: {
                    ...state.posts,
                    [postId]: {
                        isLiked: false,
                        likeCount: 0,
                        isBookmarked: false,
                        reshareCount: 0,
                        ...initialState
                    }
                }
            }));
        }
    },

    initUser: (userId, initialState) => {
        const current = get().users[userId];
        if (!current) {
            set((state) => ({
                users: {
                    ...state.users,
                    [userId]: {
                        isFollowing: false,
                        isBlocked: false,
                        ...initialState
                    }
                }
            }));
        }
    }
}));

// --- Helper Hooks ---

export const usePostInteraction = (postId: string, initialProps: Partial<PostState>) => {
    const store = useInteractionStore();

    // Init state effect - prevents "Cannot update while rendering"
    React.useEffect(() => {
        if (!store.posts[postId]) {
            store.initPost(postId, initialProps);
        }
    }, [postId, initialProps, store]);

    const postState = useInteractionStore(state => state.posts[postId]);

    // Derived state with fallback
    const isLiked = postState?.isLiked ?? initialProps.isLiked ?? false;
    const likeCount = postState?.likeCount ?? initialProps.likeCount ?? 0;
    const isBookmarked = postState?.isBookmarked ?? initialProps.isBookmarked ?? false;
    const reshareCount = postState?.reshareCount ?? initialProps.reshareCount ?? 0;

    return {
        isLiked,
        likeCount,
        isBookmarked,
        reshareCount,
        toggleLike: () => store.toggleLike(postId, isLiked, likeCount),
        toggleBookmark: () => store.toggleBookmark(postId, isBookmarked),
        toggleReshare: () => store.toggleReshare(postId, reshareCount),
    };
};

export const useUserInteraction = (userId: string, initialProps: Partial<UserState>) => {
    const store = useInteractionStore();

    // Init state effect
    React.useEffect(() => {
        if (!store.users[userId]) {
            store.initUser(userId, initialProps);
        }
    }, [userId, initialProps, store]);

    const userState = useInteractionStore(state => state.users[userId]);

    // Derived state with fallback
    const isFollowing = userState?.isFollowing ?? initialProps.isFollowing ?? false;
    const isBlocked = userState?.isBlocked ?? initialProps.isBlocked ?? false;

    return {
        isFollowing,
        isBlocked,
        toggleFollow: () => store.toggleFollow(userId, isFollowing),
        toggleBlock: () => store.toggleBlock(userId),
    };
};
