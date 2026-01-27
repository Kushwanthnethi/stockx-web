import { useEffect } from 'react';

interface UseIntersectionObserverProps {
    target: React.RefObject<Element | null>;
    onIntersect: () => void;
    enabled?: boolean;
    rootMargin?: string;
    threshold?: number;
}

export function useIntersectionObserver({
    target,
    onIntersect,
    enabled = true,
    rootMargin = '0px',
    threshold = 1.0,
}: UseIntersectionObserverProps) {
    useEffect(() => {
        if (!enabled || !target.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onIntersect();
                    }
                });
            },
            {
                root: null,
                rootMargin,
                threshold,
            }
        );

        const el = target.current;
        observer.observe(el);

        return () => {
            observer.unobserve(el);
        };
    }, [target, enabled, rootMargin, threshold, onIntersect]);
}
