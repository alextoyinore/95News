
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import AudioFeedPlayer from "@/components/AudioFeedPlayer";
import { formatDate } from "@/lib/utils";
import { Post, User } from "@/types/firestore";

// Helper to get author names (copied from page.tsx logic for consistency)
async function resolveAudioPosts(postDocs: Post[]) {
    if (postDocs.length === 0) return [];

    const authorIds = Array.from(new Set(postDocs.map(p => p.authorId)));
    const authors: { [key: string]: string } = {};

    for (const id of authorIds) {
        const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", id), limit(1)));
        if (!userSnap.empty) {
            const userData = userSnap.docs[0].data() as User;
            authors[id] = userData.displayName || userData.email || "95News";
        }
    }

    return postDocs.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || "",
        audioUrl: post.audioUrl || "",
        image: post.featuredImageUrl || "",
        author: authors[post.authorId] || "95News",
        date: formatDate(post.createdAt)
    }));
}

export const metadata = {
    title: "Audio Stories | 95News",
    description: "Listen to the latest stories from 95News."
};

export default async function AudioPage() {
    // Query posts that have a non-empty audioUrl
    // Note: Firestore inequality filter on audioUrl might require composite index if mixed with orderBy createdAt
    // For simplicity, we'll fetch latest posts and filter for audio client-side/in-memory if dataset is small,
    // or rely on 'audioUrl > ""' if indexed.
    // Let's try fetching latest published posts and filtering in JS to be safe without index creation issues right now.

    // Ideally: where("audioUrl", ">", "")
    const q = query(
        collection(db, "posts"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(50) // Fetch reasonable batch
    );

    const snap = await getDocs(q);
    const allPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    // Filter for audio
    const audioPostsRaw = allPosts.filter(p => p.audioUrl && p.audioUrl.trim().length > 0);
    const audioPosts = await resolveAudioPosts(audioPostsRaw);

    return (
        <div className="container site-content">
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800" }}>Audio Stories</h1>
                <p style={{ color: "var(--text-secondary)" }}>Listen to the news on the go.</p>
            </div>

            <AudioFeedPlayer posts={audioPosts} />
        </div>
    );
}
