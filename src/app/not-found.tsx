"use client"

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()

    return (
        <div style={{
            minHeight: 'calc(100vh - var(--nav-height))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass" style={{
                padding: '4rem 2rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto',
                    border: '1px solid var(--border)'
                }}>
                    <FileQuestion size={40} color="var(--accent)" />
                </div>

                <h1 className="gradient-text" style={{ fontSize: '5rem', marginBottom: '0.5rem', lineHeight: '1' }}>404</h1>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Page Not Found</h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you typed the URL incorrectly.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-outline"
                        style={{ flex: '1', minWidth: '140px' }}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <Link href="/" className="btn btn-primary" style={{ flex: '1', minWidth: '140px' }}>
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
