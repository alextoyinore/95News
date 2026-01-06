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
                    fontSize: "1.8rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "3px solid var(--accent)",
                    marginBottom: "-1px",
                    display: "inline-block"
                }}>
                    {title}
                </h3>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: "2rem"
            }}>
                {posts.map(post => (
                    <PostGridItem key={post.id} post={post} />
                ))}
            </div>
        </section>
    );
}

function PostGridItem({ post }: { post: any }) {
    return (
        <PostCard post={post} variant="vertical" />
    );
}
