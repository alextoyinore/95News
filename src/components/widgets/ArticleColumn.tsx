"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSectionPosts } from "@/lib/cmsActions";

interface ArticleColumnProps {
    title?: string;
    categorySlug?: string;
    limit?: number;
    viewAllLink?: string;
}

export default function ArticleColumn({ title, categorySlug, limit = 5, viewAllLink }: ArticleColumnProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            if (!categorySlug) {
                setLoading(false);
                return;
            }
            try {
                const data = await fetchSectionPosts(categorySlug, limit);
                setPosts(data);
            } catch (error) {
                console.error("Error fetching article column posts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, [categorySlug, limit]);

    if (loading) {
        return (
            <div className="article-column-loading">
                {title && <h3 className="widget-title">{title}</h3>}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="glass" style={{ height: "80px", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="article-column-widget">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>{title || posts[0]?.category}</h3>
                {viewAllLink && (
                    <Link href={viewAllLink} style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--accent)" }}>
                        View All
                    </Link>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {posts.map((post) => (
                    <div key={post.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                        {post.image && (
                            <div style={{ width: "80px", height: "80px", flexShrink: 0, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                                <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <Link href={`/${post.slug}`}>
                                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.3", margin: "0 0 0.4rem 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {post.title}
                                </h4>
                            </Link>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>{post.author}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
