import { doc, getDoc, getDocs, collection, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Post } from "@/types/firestore";
import { notFound } from "next/navigation";
import FetchMorePosts from "@/components/FetchMorePosts";
import { formatDate, getAuthorSlug, getDateSlugs } from "@/lib/utils";

interface AuthorArchiveProps {
    params: Promise<{ id: string }>;
}

export default async function AuthorArchive({ params }: AuthorArchiveProps) {
    const { id } = await params;

    const userDocRef = doc(db, "users", id);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        notFound();
    }

    const author = { id: userDocSnap.id, ...userDocSnap.data() } as User;
    const authorName = author.displayName || author.email || "Unknown Author";
    const limitCount = 8;

    // Fetch initial posts for the author
    const q = query(
        collection(db, "posts"),
        where("authorId", "==", author.id),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );

    const snap = await getDocs(q);
    const postDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    // Resolve authors for initial posts (just this author)
    const authors: { [key: string]: { name: string, slug: string } } = {
        [author.id]: {
            name: authorName,
            slug: getAuthorSlug(author)
        }
    };

    const initialPosts = postDocs.map(post => {
        const { year, month, day } = getDateSlugs(post.createdAt);
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            category: "News",
            categorySlug: "news",
            author: authorName,
            authorId: author.id,
            date: formatDate(post.createdAt),
            dateSlug: `/archive/${year}/${month}/${day}`,
            image: post.featuredImageUrl
        };
    });

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            <div className="author-header glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)", marginBottom: "4rem", display: "flex", gap: "3rem", alignItems: "center" }}>
                <div style={{ width: "120px", height: "120px", flexShrink: 0, borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {author.photoURL ? (
                        <img src={author.photoURL} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ fontSize: "3rem", fontWeight: "800", color: "white" }}>{authorName[0].toUpperCase()}</div>
                    )}
                </div>
                <div>
                    <span style={{ color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Author Profile</span>
                    <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", margin: "0.5rem 0" }}>{authorName}</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "800px" }}>
                        {author.bio || `Contributor to 95News. Sharing insights and updates on various topics.`}
                    </p>
                </div>
            </div>

            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                Latest from {authorName}
            </h2>

            <FetchMorePosts
                initialPosts={initialPosts}
                limitCount={limitCount}
                queryConstraints={[
                    { field: "authorId", operator: "==", value: author.id }
                ]}
                initialAuthors={authors}
                context={{
                    category: "News",
                    author: authorName,
                    authorSlug: getAuthorSlug(author)
                }}
            />
        </div>
    );
}
