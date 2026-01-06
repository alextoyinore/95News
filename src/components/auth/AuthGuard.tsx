"use client";

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, userRecord, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const STAFF_ROLES = ['superuser', 'editor', 'writer', 'contributor'];
    const SUPERUSER_ONLY_PAGES = ['/dashboard/users', '/dashboard/navigation', '/dashboard/layout-builder', '/dashboard/pages'];

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (userRecord) {
                const isStaff = STAFF_ROLES.includes(userRecord.role);
                const isSuperuser = userRecord.role === 'superuser';
                const isAccessingRestricted = SUPERUSER_ONLY_PAGES.some(page => pathname.startsWith(page));

                if (!isStaff) {
                    router.push('/');
                } else if (isAccessingRestricted && !isSuperuser) {
                    router.push('/dashboard');
                }
            }
        }
    }, [user, userRecord, loading, router, pathname]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)'
            }}>
                Checking Permissions...
            </div>
        );
    }

    const isStaff = userRecord && ['superuser', 'editor', 'writer', 'contributor'].includes(userRecord.role);

    if (!user || !isStaff) {
        return null;
    }

    return <>{children}</>;
}
