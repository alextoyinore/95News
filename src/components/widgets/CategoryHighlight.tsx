"use client";

import Link from "next/link";
import PostCard from "../PostCard";

interface CategoryHighlightProps {
    title: string;
    posts: any[];
}

export default function CategoryHighlight({ title, posts }: CategoryHighlightProps) {
    if (!posts || posts.length === 0) return null;

    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 4);

    return (
        <section style={{ marginBottom: "4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                    paddingBottom: "0.5rem",
                    borderBottom: "3px solid var(--accent)",
                    marginBottom: "-1px",
                    display: "inline-block"
                }}>
                    {title}
                </h3>
                <Link href={`/category/${title.toLowerCase()}`} style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: "600" }}>
                    View All →
                </Link>
            </div>

            <div className="highlight-grid" style={{ display: "grid", gap: "2.5rem" }}>
                <div style={{ height: "100%" }}>
                    <PostCard post={mainPost} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {sidePosts.map((post, idx) => (
                        <div key={post.id}>
                            <PostCard post={{ ...post, image: undefined }} variant="horizontal" />
                            {idx < sidePosts.length - 1 && (
                                <div style={{ height: "1px", backgroundColor: "var(--border)", marginTop: "1.5rem" }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .highlight-grid {
                    grid-template-columns: 55fr 45fr;
                }
                @media (max-width: 768px) {
                    .highlight-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    );
}
