import Link from "next/link";
import PostCard from "@/components/PostCard";

export default async function CategoryArchive({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    const posts = [
        { id: 1, title: `${categoryName} Innovation: What to Expect in 2026`, excerpt: "A deep dive into the upcoming trends that will define the industry foryears to come.", category: categoryName, author: "Sarah Jenkins", date: "Oct 24, 2025", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" },
        { id: 2, title: `The Impact of ${categoryName} on Global Sustainability`, excerpt: "How leaders are leveraging new methodologies to reduce their carbon footprint.", category: categoryName, author: "James Miller", date: "Oct 22, 2025", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800" },
        { id: 3, title: `Mastering ${categoryName}: A Beginner's Guide`, excerpt: "Everything you need to know to get started with this transformative field.", category: categoryName, author: "Elena Vance", date: "Oct 20, 2025", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800" },
        { id: 4, title: `Top 10 ${categoryName} Trends This Year`, excerpt: "From minor tweaks to major overhauls, these are the changes that matter.", category: categoryName, author: "David Bowie", date: "Oct 18, 2025", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" },
    ];

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <div style={{ marginBottom: "4rem", textAlign: "center" }}>
                <span style={{ color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Archive</span>
                <h1 style={{ fontSize: "4rem", marginTop: "0.5rem" }}>{categoryName}</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", maxWidth: "600px", margin: "1rem auto" }}>
                    Exploring the latest stories, deep-dives, and insights in the world of {categoryName.toLowerCase()}.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem" }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            <div style={{ marginTop: "4rem", textAlign: "center" }}>
                <button className="btn" style={{ border: "1px solid var(--border)", padding: "0.8rem 2.5rem" }}>
                    Load More Stories
                </button>
            </div>
        </div>
    );
}
