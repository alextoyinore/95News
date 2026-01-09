"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Tag } from "@/types/firestore";

export default function TrendingTags() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const q = query(collection(db, "tags"), limit(15));
                const snap = await getDocs(q);
                setTags(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag)));
            } catch (error) {
                console.error("Error fetching trending tags:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    }, []);

    if (loading) return <div className="glass" style={{ height: "100px", borderRadius: "var(--radius-md)", animation: "pulse 1.5s infinite" }} />;
    if (tags.length === 0) return null;

    return (
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.3rem", display: "inline-block" }}>
                Trending Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                {tags.map(tag => (
                    <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        style={{
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            backgroundColor: "var(--bg-tertiary)",
                            borderRadius: "20px",
                            transition: "all 0.2s ease",
                            border: "1px solid var(--border)"
                        }}
                        className="hover-tag"
                    >
                        #{tag.name}
                    </Link>
                ))}
            </div>
            <style jsx>{`
                .hover-tag:hover {
                    background-color: var(--accent) !important;
                    color: white !important;
                    border-color: var(--accent) !important;
                    transform: translateY(-2px);
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
