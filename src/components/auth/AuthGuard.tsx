"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, userRecord, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (userRecord && !['superuser', 'writer'].includes(userRecord.role)) {
                // If logged in but not staff, redirect or show error
                // For now, redirect to home or a special unauthorized page
                router.push('/');
            }
        }
    }, [user, userRecord, loading, router]);

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

    if (!user || (userRecord && !['superuser', 'writer'].includes(userRecord.role))) {
        return null;
    }

    return <>{children}</>;
}
