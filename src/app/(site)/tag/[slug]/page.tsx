import Link from "next/link";
import PostCard from "@/components/PostCard";

export default async function TagArchive({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tagName = slug.toUpperCase();

    const posts = [
        { id: 101, title: `Unlocking the Power of #${tagName}`, excerpt: "How this specific hashtag is trending across platforms and what it means for creators.", category: "Marketing", author: "Digital Guru", date: "Oct 24, 2025", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800" },
        { id: 102, title: `The Best Projects Using #${tagName} This Week`, excerpt: "A roundup of incredible community contributions and innovative implementations.", category: "Community", author: "Tag Watcher", date: "Oct 21, 2025", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" },
    ];

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <div style={{ marginBottom: "4rem" }}>
                <span style={{ color: "var(--accent)", fontWeight: "700" }}>Topic Archive</span>
                <h1 style={{ fontSize: "3.5rem" }}>#{tagName}</h1>
                <div style={{ height: "4px", width: "100px", backgroundColor: "var(--accent)", marginTop: "1rem" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem" }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
