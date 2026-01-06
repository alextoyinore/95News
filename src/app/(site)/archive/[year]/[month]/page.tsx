import Link from "next/link";
import PostCard from "@/components/PostCard";

export default async function DateArchive({ params }: { params: Promise<{ year: string, month: string }> }) {
    const { year, month } = await params;
    const monthName = month.charAt(0).toUpperCase() + month.slice(1);

    const posts = [
        { id: 301, title: `Flashback: The Biggest Stories of ${monthName} ${year}`, excerpt: "Revisiting the headlines that dominated the conversation this month.", category: "Archive", author: "9to5 Staff", date: `${monthName} 2025`, image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800" },
    ];

    return (
        <div className="container" style={{ padding: "4rem 1.5rem" }}>
            <div style={{ marginBottom: "4rem", borderBottom: "2px solid var(--accent)", paddingBottom: "2rem" }}>
                <h1 style={{ fontSize: "3rem" }}>Archive: {monthName} {year}</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                    Browsing through all stories published in {monthName} {year}.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem" }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
