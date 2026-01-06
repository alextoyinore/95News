import Link from "next/link";
import PostCard from "@/components/PostCard";

export default async function AuthorArchive({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const authorName = username.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    const posts = [
        { id: 201, title: "The Economic Shift: Why We Need a New Perspective", excerpt: "Analyzing the deep structural changes in global trade and what they mean for the average consumer.", category: "World", author: authorName, date: "Dec 20, 2025", image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800" },
        { id: 202, title: "Why Local Journalism is More Important Than Ever", excerpt: "In the age of global news cycles, it's the stories in our backyard that truly sustain democracy.", category: "Journalism", author: authorName, date: "Dec 15, 2025", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800" },
    ];

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)", marginBottom: "4rem", display: "flex", gap: "3rem", alignItems: "center" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "800", color: "white" }}>
                    {authorName[0]}
                </div>
                <div>
                    <span style={{ color: "var(--accent)", fontWeight: "700", textTransform: "uppercase" }}>Author Profile</span>
                    <h1 style={{ fontSize: "3rem", margin: "0.5rem 0" }}>{authorName}</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Senior Investigative Journalist covering global economics and digital transformation.
                        Contributor to NineToFive since 2023.
                    </p>
                </div>
            </div>

            <h2 style={{ fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                Latest from {authorName}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem" }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
