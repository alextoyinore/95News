"use client";

import React from 'react';
import Link from 'next/link';

const categories = ["World", "Politics", "Tech", "Lifestyle", "Sports", "Health"];
const months = ["January 2025", "December 2024", "November 2024", "October 2024"];

export default function ArchivePage() {
    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "3rem" }}>Browse Archive</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
                {/* Categories Archive */}
                <section>
                    <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>
                        By Category
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                        {categories.map(cat => (
                            <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                                <div className="glass" style={{
                                    padding: "1.5rem",
                                    textAlign: "center",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: "600"
                                }}>
                                    {cat}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Date Archive */}
                <section>
                    <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>
                        By Date
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {months.map(month => (
                            <Link key={month} href={`/archive/${month.toLowerCase().replace(/\s+/g, '-')}`}>
                                <div className="glass" style={{
                                    padding: "1rem 1.5rem",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <span>{month}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>12+ Stories</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
