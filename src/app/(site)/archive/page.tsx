"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Category } from "@/types/firestore";

export default function ArchivePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const q = query(collection(db, "categories"), orderBy("name", "asc"));
                const snap = await getDocs(q);
                setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const months = [
        { label: "January 2026", slug: "2026/01" },
        { label: "December 2025", slug: "2025/12" },
        { label: "November 2025", slug: "2025/11" },
        { label: "October 2025", slug: "2025/10" }
    ];

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "3rem" }}>Browse Archive</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
                {/* Categories Archive */}
                <section>
                    <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>
                        By Category
                    </h2>
                    {loading ? (
                        <p>Loading categories...</p>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                            {categories.map(cat => (
                                <Link key={cat.id} href={`/category/${cat.slug}`}>
                                    <div className="glass" style={{
                                        padding: "1.5rem",
                                        textAlign: "center",
                                        borderRadius: "var(--radius-md)",
                                        fontWeight: "600",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        {cat.name}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Date Archive */}
                <section>
                    <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>
                        By Date
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {months.map(m => (
                            <Link key={m.slug} href={`/archive/${m.slug}`}>
                                <div className="glass" style={{
                                    padding: "1rem 1.5rem",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <span>{m.label}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Browse Stories</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
