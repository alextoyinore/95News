import Link from "next/link";

interface PostCardProps {
    post: {
        id: number | string;
        title: string;
        excerpt?: string;
        category: string;
        author?: string;
        date: string;
        image?: string;
    };
    variant?: "horizontal" | "vertical" | "compact" | "minimal";
}

export default function PostCard({ post, variant = "vertical" }: PostCardProps) {
    if (variant === "minimal") {
        return (
            <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.75rem", textTransform: "uppercase" }}>{post.category}</span>
                    <h4 style={{ fontSize: "1.05rem", lineHeight: "1.4" }}>{post.title}</h4>
                </div>
            </Link>
        );
    }

    if (variant === "horizontal") {
        return (
            <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "start" }}>
                    {post.image && (
                        <div style={{ width: "120px", height: "120px", flexShrink: 0, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                            <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.75rem", textTransform: "uppercase" }}>{post.category}</span>
                        <h4 style={{ fontSize: "1.2rem", margin: "0.5rem 0", lineHeight: "1.4" }}>{post.title}</h4>
                        {post.excerpt && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.8rem", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>}
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "1rem" }}>
                            <span>{post.author}</span>
                            <span>{post.date}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === "compact") {
        return (
            <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
                <article className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", height: "100%", display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.75rem", textTransform: "uppercase" }}>{post.category}</span>
                    <h4 style={{ fontSize: "1.2rem", margin: "0.8rem 0" }}>{post.title}</h4>
                    <div style={{ marginTop: "auto", color: "var(--text-muted)", fontSize: "0.8rem" }}>{post.date}</div>
                </article>
            </Link>
        );
    }

    return (
        <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
            <article style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {post.image && (
                    <div style={{ height: "240px", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "1.5rem" }}>
                        <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                )}
                <div>
                    <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase" }}>{post.category}</span>
                    <h3 style={{ fontSize: "1.5rem", margin: "0.8rem 0", lineHeight: "1.3" }}>{post.title}</h3>
                    {post.excerpt && <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.2rem" }}>{post.excerpt}</p>}
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        <span>{post.author}</span>
                        <span>{post.date}</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
