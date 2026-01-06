"use client";

import React from 'react';

export default function Newsletter() {
    return (
        <div className="glass" style={{
            padding: "4rem 2rem",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            background: "linear-gradient(135deg, hsla(20, 90%, 55%, 0.1), hsla(20, 90%, 55%, 0.05))",
            border: "1px solid var(--accent)",
            margin: "4rem 0"
        }}>

            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Stay Ahead of the Curve</h2>
            <p style={{
                color: "var(--text-secondary)",
                fontSize: "1.2rem",
                maxWidth: "600px",
                margin: "0 auto 2.5rem"
            }}>
                Join 50,000+ subscribers who get our curated digest of tech, culture, and business every morning.
            </p>
            <form style={{
                display: "flex",
                gap: "1rem",
                maxWidth: "500px",
                margin: "0 auto"
            }} onSubmit={(e) => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="Enter your email address..."
                    style={{
                        flex: 1,
                        padding: "1rem 1.5rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        outline: "none"
                    }}
                />
                <button className="btn btn-primary" style={{ padding: "0 2rem", borderRadius: "var(--radius-md)" }}>
                    Subscribe
                </button>
            </form>
            <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No spam. Ever. Unsubscribe with one click.
            </p>
        </div>
    );
}
