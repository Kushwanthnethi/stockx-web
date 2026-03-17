"use client";

import dynamic from "next/dynamic";

const GoogleOneTap = dynamic(() => import("@/components/shared/google-one-tap").then((mod) => mod.GoogleOneTap), {
    ssr: false,
});

const MaintenancePopup = dynamic(() => import("@/components/shared/maintenance-popup").then((mod) => mod.MaintenancePopup), {
    ssr: false,
});

const GuestAuthModal = dynamic(() => import("@/components/shared/guest-auth-modal").then((mod) => mod.GuestAuthModal), {
    ssr: false,
});

const SebiDisclaimerModal = dynamic(() => import("@/components/shared/sebi-disclaimer-modal").then((mod) => mod.SebiDisclaimerModal), {
    ssr: false,
});

export function DeferredGlobalOverlays() {
    return (
        <>
            <GoogleOneTap />
            <MaintenancePopup />
            <GuestAuthModal />
            <SebiDisclaimerModal />
        </>
    );
}
