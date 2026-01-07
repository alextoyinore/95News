"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('95news_cookie_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('95news_cookie_consent', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.5s ease'
        }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Cookie Usage</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                We use cookies to ensure you get the best experience on our website. By continuing to use our site, you accept our use of cookies.
                <Link href="/cookie-policy" style={{ color: 'var(--accent)', marginLeft: '0.5rem', textDecoration: 'underline' }}>
                    Learn more
                </Link>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    onClick={acceptCookies}
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}
                >
                    Accept
                </button>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
