'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    handle: string;
    avatarUrl?: string;
    role?: string;
    isVerified?: boolean;
    verified?: boolean; // Legacy/Alias support
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    logout: () => void;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    logout: () => { },
    showLoginModal: false,
    setShowLoginModal: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function loadUser() {
            const storedToken = localStorage.getItem('accessToken');
            setToken(storedToken);

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);

                    // Record Visit (Fire and Forget)
                    fetch(`${API_BASE_URL}/users/record-visit`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${storedToken}` }
                    }).catch(err => console.error("Failed to record visit", err));

                } else {
                    localStorage.removeItem('accessToken');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load user', error);
                localStorage.removeItem('accessToken');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, logout, showLoginModal, setShowLoginModal }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
