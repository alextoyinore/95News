"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    startAfter,
} from "firebase/firestore";
import { Post, User } from "@/types/firestore";
import { formatDate, getAuthorSlug, getDateSlugs } from "@/lib/utils";

interface AuthorInfo {
    name: string;
    slug: string;
    id?: string;
}

interface FetchMorePostsProps {
    initialPosts: any[];
    queryConstraints: {
        field: string;
        value: any;
        operator: "array-contains" | "==" | ">=" | "<=";
    }[];
    limitCount: number;
    initialAuthors: { [key: string]: AuthorInfo };
    context: {
        category?: string;
        categorySlug?: string;
        author?: string;
        authorSlug?: string;
    };
}

export default function FetchMorePosts({ initialPosts, queryConstraints, limitCount, initialAuthors, context }: FetchMorePostsProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [authorsCache, setAuthorsCache] = useState<{ [key: string]: AuthorInfo }>(initialAuthors);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPosts.length >= limitCount);

    const resolveAuthor = async (authorId: string): Promise<AuthorInfo> => {
        if (authorsCache[authorId]) return authorsCache[authorId];

        try {
            const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", authorId), limit(1)));
            if (!userSnap.empty) {
                const userData = userSnap.docs[0].data() as User;
                const info = {
                    name: userData.displayName || userData.email || "Unknown Author",
                    slug: getAuthorSlug(userData),
                    id: userData.id
                };
                setAuthorsCache(prev => ({ ...prev, [authorId]: info }));
                return info;
            }
        } catch (e) {
            console.error("Error resolving author:", e);
        }

        return { name: "95News Staff", slug: "95news-staff" };
    };

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            let lastVisible = lastDoc;

            if (!lastVisible) {
                const constraints = queryConstraints.map(c => {
                    let val = c.value;
                    if (c.field === "createdAt" && typeof val === "string") {
                        val = new Date(val);
                    }
                    return where(c.field, c.operator, val);
                });

                const baseQ = query(
                    collection(db, "posts"),
                    ...constraints,
                    where("status", "==", "published"),
                    orderBy("createdAt", "desc"),
                    limit(limitCount)
                );
                const snapshot = await getDocs(baseQ);
                if (snapshot.empty) {
                    setHasMore(false);
                    return;
                }
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }

            const constraints = queryConstraints.map(c => {
                let val = c.value;
                if (c.field === "createdAt" && typeof val === "string") {
                    val = new Date(val);
                }
                return where(c.field, c.operator, val);
            });

            const nextQ = query(
                collection(db, "posts"),
                ...constraints,
                where("status", "==", "published"),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(limitCount)
            );

            const nextSnapshot = await getDocs(nextQ);

            if (nextSnapshot.empty) {
                setHasMore(false);
            } else {
                const newPosts = await Promise.all(nextSnapshot.docs.map(async doc => {
                    const data = { id: doc.id, ...doc.data() } as Post;
                    const auth = await resolveAuthor(data.authorId);
                    const { year, month, day } = getDateSlugs(data.createdAt);

                    return {
                        id: data.id,
                        slug: data.slug,
                        title: data.title,
                        excerpt: data.excerpt || "",
                        category: context.category || "Article",
                        categorySlug: context.categorySlug,
                        author: context.author || auth.name,
                        authorId: data.authorId,
                        authorSlug: context.authorSlug || auth.slug,
                        date: formatDate(data.createdAt),
                        dateSlug: `/archive/${year}/${month}/${day}`,
                        image: data.featuredImageUrl
                    };
                }));

                setPosts([...posts, ...newPosts]);
                setLastDoc(nextSnapshot.docs[nextSnapshot.docs.length - 1]);
                if (nextSnapshot.docs.length < limitCount) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
        } finally {
            setLoading(false);
        }
    };

    if (posts.length === 0) return null;

    return (
        <>
            <div className="post-grid">
                {posts.map((post, idx) => (
                    <PostCard key={`${post.id}-${idx}`} post={post} />
                ))}
            </div>

            {hasMore && (
                <div style={{ marginTop: "4rem", textAlign: "center" }}>
                    <button
                        className="btn"
                        onClick={loadMore}
                        disabled={loading}
                        style={{ border: "1px solid var(--border)", padding: "0.8rem 2.5rem" }}
                    >
                        {loading ? "Loading..." : "Load More Stories"}
                    </button>
                </div>
            )}
        </>
    );
}
