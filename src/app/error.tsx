"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

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
                    <AlertOctagon size={40} color="var(--accent)" />
                </div>

                <h1 className="gradient-text" style={{ fontSize: '5rem', marginBottom: '0.5rem', lineHeight: '1' }}>500</h1>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Internal Server Error</h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Oops! Something went wrong on our end. Our servers are having a little trouble right now. We apologize for the inconvenience.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => reset()}
                        className="btn btn-outline"
                        style={{ flex: '1', minWidth: '140px' }}
                    >
                        <RotateCcw size={18} />
                        Try Again
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
