'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (pathname === '/login') {
                if (token && user) {
                    router.push('/');
                } else {
                    setIsAuthorized(true);
                }
            } else {
                if (!token || !user) {
                    router.push('/login');
                    setIsAuthorized(false);
                } else {
                    setIsAuthorized(true);
                }
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
