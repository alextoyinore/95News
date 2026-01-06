"use client";

import PostCard from "../PostCard";

interface PostGridProps {
    title: string;
    posts: any[];
    columns?: number;
}

export default function PostGrid({ title, posts, columns = 3 }: PostGridProps) {
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
            </div>

            <div className={`grid-layout columns-${columns}`} style={{
                display: "grid",
                gap: "2rem"
            }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} variant="vertical" />
                ))}
            </div>

            <style jsx>{`
                .grid-layout {
                    grid-template-columns: repeat(1, 1fr);
                }
                @media (min-width: 640px) {
                    .grid-layout {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .grid-layout.columns-3 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .grid-layout.columns-4 {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
        </section>
    );
}
