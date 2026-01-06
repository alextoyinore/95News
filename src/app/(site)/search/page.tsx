"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const mockResults = [
    { id: 1, title: "The Future of AI in Modern Journalism", category: "Tech", date: "Oct 24, 2025" },
    { id: 3, title: "Election 2024: Key Battleground States", category: "Politics", date: "Oct 22, 2025" },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Search</h1>

            <div style={{ marginBottom: "4rem", maxWidth: "600px" }}>
                <input
                    type="text"
                    placeholder="Search for stories, categories, or authors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "1rem 1.5rem",
                        fontSize: "1.2rem",
                        borderRadius: "var(--radius-lg)",
                        border: "2px solid var(--border)",
                        backgroundColor: "transparent",
                        outline: "none",
                        transition: "border-color 0.3s ease"
                    }}
                />
            </div>

            <div>
                <h3 style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
                    {query ? `Results for "${query}"` : "Recent Stories"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {mockResults.map(result => (
                        <Link key={result.id} href={`/${result.id}`}>
                            <article className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                                <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase" }}>
                                    {result.category}
                                </span>
                                <h4 style={{ fontSize: "1.4rem", margin: "0.5rem 0" }}>{result.title}</h4>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{result.date}</div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
