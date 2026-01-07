import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Tag, Post, User } from "@/types/firestore";
import FetchMorePosts from "@/components/FetchMorePosts";

const formatDate = (dateVal: any) => {
    if (!dateVal) return "Unknown Date";
    try {
        if (dateVal && typeof dateVal.toDate === 'function') {
            return dateVal.toDate().toLocaleDateString();
        }
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleDateString();
    } catch (e) {
        return "Invalid Date";
    }
};

const getAuthorSlug = (user: User) => {
    return (user.displayName || user.email.split('@')[0]).toLowerCase().replace(/\s+/g, '-');
};

const getDateSlugs = (dateVal: any) => {
    try {
        const d = dateVal && typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal);
        if (isNaN(d.getTime())) return { year: "2026", month: "january" };
        return {
            year: d.getFullYear().toString(),
            month: d.toLocaleString('default', { month: 'long' }).toLowerCase()
        };
    } catch (e) {
        return { year: "2026", month: "january" };
    }
};

export default async function TagArchive({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const tagQuery = query(collection(db, "tags"), where("slug", "==", slug), limit(1));
    const tagSnap = await getDocs(tagQuery);

    if (tagSnap.empty) {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <h1>Topic Not Found</h1>
                <Link href="/archive" style={{ color: "var(--accent)" }}>Back to Archive</Link>
            </div>
        );
    }

    const tag = { id: tagSnap.docs[0].id, ...tagSnap.docs[0].data() } as Tag;
    const tagName = tag.name;

    const limitCount = 12;
    const postsQuery = query(
        collection(db, "posts"),
        where("tagIds", "array-contains", tag.id),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const postsSnap = await getDocs(postsQuery);
    const postDocs = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    const authorIds = Array.from(new Set(postDocs.map(p => p.authorId)));
    const authors: { [key: string]: { name: string, slug: string } } = {};

    if (authorIds.length > 0) {
        for (const id of authorIds) {
            const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", id), limit(1)));
            if (!userSnap.empty) {
                const userData = userSnap.docs[0].data() as User;
                authors[id] = {
                    name: userData.displayName || userData.email || "Unknown Author",
                    slug: getAuthorSlug(userData)
                };
            }
        }
    }

    const initialPosts = postDocs.map(post => {
        const { year, month } = getDateSlugs(post.publishedAt || post.createdAt);
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            category: "Article",
            author: authors[post.authorId]?.name || "95News",
            authorId: post.authorId,
            authorSlug: authors[post.authorId]?.slug || "95news",
            date: formatDate(post.publishedAt || post.createdAt),
            dateSlug: `/archive/${year}/${month}`,
            image: post.featuredImageUrl
        };
    });

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "4rem" }}>
                <span style={{ color: "var(--accent)", fontWeight: "700" }}>Topic Archive</span>
                <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}>#{tagName}</h1>
                <div style={{ height: "4px", width: "100px", backgroundColor: "var(--accent)", marginTop: "1rem" }} />
            </div>

            <FetchMorePosts
                initialPosts={initialPosts}
                limitCount={limitCount}
                queryConstraints={[
                    { field: "tagIds", operator: "array-contains", value: tag.id }
                ]}
                initialAuthors={authors}
                context={{
                    category: "News"
                }}
            />
        </div>
    );
}
