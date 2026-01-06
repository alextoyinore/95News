import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Category, Post, User } from "@/types/firestore";
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

export default async function CategoryArchive({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const catQuery = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
    const catSnap = await getDocs(catQuery);

    if (catSnap.empty) {
        return (
            <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
                <h1>Category Not Found</h1>
                <Link href="/archive" style={{ color: "var(--accent)" }}>Back to Archive</Link>
            </div>
        );
    }

    const category = { id: catSnap.docs[0].id, ...catSnap.docs[0].data() } as Category;
    const categoryName = category.name;

    const limitCount = 12;
    const postsQuery = query(
        collection(db, "posts"),
        where("categoryIds", "array-contains", category.id),
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
            category: categoryName,
            categorySlug: category.slug,
            author: authors[post.authorId]?.name || "NineToFive Staff",
            authorId: post.authorId,
            authorSlug: authors[post.authorId]?.slug || "ninetofive-staff",
            date: formatDate(post.publishedAt || post.createdAt),
            dateSlug: `/archive/${year}/${month}`,
            image: post.featuredImageUrl
        };
    });

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "4rem", textAlign: "center" }}>
                <span style={{ color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Archive</span>
                <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", marginTop: "0.5rem" }}>{categoryName}</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", maxWidth: "600px", margin: "1rem auto" }}>
                    Exploring the latest stories, deep-dives, and insights in the world of {categoryName.toLowerCase()}.
                </p>
            </div>

            <FetchMorePosts
                initialPosts={initialPosts}
                limitCount={limitCount}
                queryConstraints={[
                    { field: "categoryIds", operator: "array-contains", value: category.id }
                ]}
                initialAuthors={authors}
                context={{
                    category: categoryName,
                    categorySlug: category.slug
                }}
            />
        </div>
    );
}
