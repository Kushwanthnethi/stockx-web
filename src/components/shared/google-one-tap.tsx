'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { API_BASE_URL } from '@/lib/config';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

export function GoogleOneTap() {
    const { user, isLoading } = useAuth();
    const initializedRef = useRef(false);

    const handleCredentialResponse = useCallback(async (response: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/google/one-tap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('accessToken', data.access_token);
                // Hard reload to ensure AuthProvider picks up the new token
                window.location.href = '/';
            } else {
                console.error('Google One Tap login failed');
            }
        } catch (error) {
            console.error('Google One Tap error:', error);
        }
    }, []);

    useEffect(() => {
        // Don't show if user is already logged in, still loading, or already initialized
        if (isLoading || user || initializedRef.current) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn('Google Client ID not configured for One Tap');
            return;
        }

        // Check if user dismissed in this session
        if (sessionStorage.getItem('google_one_tap_dismissed') === 'true') return;

        // Load the Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (!window.google || initializedRef.current) return;
            initializedRef.current = true;

            const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            const currentDomain = typeof window !== 'undefined' ? window.location.href : 'unknown';

            console.log('[GoogleOneTap Debug]', {
                isLocalhost,
                currentDomain,
                clientId: clientId ? 'configured' : 'missing',
                timestamp: new Date().toISOString(),
            });

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    itp_support: true, // Always enable for better compatibility
                    use_fedcm_for_prompt: true, // Always enable for better compatibility
                });

                // Show the prompt
                window.google.accounts.id.prompt((notification: any) => {
                    const debugInfo = {
                        isNotDisplayed: notification.isNotDisplayed(),
                        isSkippedMoment: notification.isSkippedMoment(),
                        isDismissedMoment: notification.isDismissedMoment(),
                    };

                    if (notification.isNotDisplayed()) {
                        console.warn('[GoogleOneTap] Not displayed - Reason:', notification.getNotDisplayedReason());
                    }
                    if (notification.isSkippedMoment()) {
                        console.log('[GoogleOneTap] Skipped - Reason:', notification.getSkippedReason());
                    }
                    if (notification.isDismissedMoment()) {
                        console.log('[GoogleOneTap] Dismissed - Reason:', notification.getDismissedReason());
                        sessionStorage.setItem('google_one_tap_dismissed', 'true');
                    }
                    console.log('[GoogleOneTap Notification]', debugInfo);
                });
            } catch (error) {
                console.error('[GoogleOneTap] Initialization error:', error);
            }
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup
            if (window.google) {
                window.google.accounts.id.cancel();
            }
            // Only remove script if it's still in the DOM
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            initializedRef.current = false;
        };
    }, [user, isLoading, handleCredentialResponse]);

    // This component doesn't render anything visible — the popup is controlled by Google's script
    return null;
}
