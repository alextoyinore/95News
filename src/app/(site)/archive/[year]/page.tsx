import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Post, User } from "@/types/firestore";
import FetchMorePosts from "@/components/FetchMorePosts";
import { formatDate, getAuthorSlug, getDateSlugs } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function YearArchive({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params;

    if (!/^\d{4}$/.test(year)) return notFound();

    const startRange = new Date(parseInt(year), 0, 1); // Jan 1st
    const endRange = new Date(parseInt(year), 11, 31, 23, 59, 59, 999); // Dec 31st end of day

    const title = `Archive: ${year}`;
    const description = `Browsing through all stories published in ${year}.`;

    const limitCount = 20;

    const postsQuery = query(
        collection(db, "posts"),
        where("status", "==", "published"),
        where("createdAt", ">=", startRange),
        where("createdAt", "<=", endRange),
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
        const { year: pYear, month: pMonth, day: pDay } = getDateSlugs(post.createdAt);
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            category: "Article",
            author: authors[post.authorId]?.name || "95News",
            authorId: post.authorId,
            authorSlug: authors[post.authorId]?.slug || "95news",
            date: formatDate(post.createdAt),
            dateSlug: `/archive/${pYear}/${pMonth}/${pDay}`,
            image: post.featuredImageUrl
        };
    });

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "4rem", borderBottom: "2px solid var(--accent)", paddingBottom: "2rem" }}>
                <h1 style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>{title}</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                    {description}
                </p>
            </div>

            {initialPosts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
                    <h3>No stories found for this period.</h3>
                    <Link href="/archive" style={{ color: "var(--accent)", marginTop: "1rem", display: "inline-block" }}>
                        Back to Archives
                    </Link>
                </div>
            ) : (
                <FetchMorePosts
                    initialPosts={initialPosts}
                    limitCount={limitCount}
                    queryConstraints={[
                        { field: "createdAt", operator: ">=", value: startRange.toISOString() },
                        { field: "createdAt", operator: "<=", value: endRange.toISOString() }
                    ]}
                    initialAuthors={authors}
                    context={{
                        category: "News"
                    }}
                />
            )}
        </div>
    );
}
