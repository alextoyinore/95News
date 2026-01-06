"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, user, userRecord } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user && userRecord) {
            if (['superuser', 'writer'].includes(userRecord.role)) {
                router.push('/dashboard');
            }
        }
    }, [user, userRecord, router]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError('Failed to sign in with Google');
            console.error(err);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError('Invalid email or password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Log In</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Welcome back to NineToFive</p>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {user && userRecord && !['superuser', 'writer'].includes(userRecord.role) && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        Access Denied: You do not have permission to access the dashboard.
                    </div>
                )}

                <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="btn"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '0.8rem',
                        backgroundColor: '#fff',
                        color: '#333',
                        border: '1px solid #ddd',
                        fontWeight: '500'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Log In with Google
                </button>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Register Now</Link>
                </p>

                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
