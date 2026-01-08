"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, startAfter } from "firebase/firestore";
import { Post, Category, User } from "@/types/firestore";
import { formatDate, getAuthorSlug } from "@/lib/utils";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export default function LatestNewsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const BATCH_SIZE = 12;

    const fetchPosts = async (isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            let q = query(
                collection(db, "posts"),
                where("status", "==", "published"),
                orderBy("createdAt", "desc"),
                limit(BATCH_SIZE)
            );

            if (isLoadMore && lastDoc) {
                q = query(
                    collection(db, "posts"),
                    where("status", "==", "published"),
                    orderBy("createdAt", "desc"),
                    startAfter(lastDoc),
                    limit(BATCH_SIZE)
                );
            }

            const snap = await getDocs(q);
            if (snap.empty) {
                setHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            const newLastDoc = snap.docs[snap.docs.length - 1];
            setLastDoc(newLastDoc);

            if (snap.docs.length < BATCH_SIZE) {
                setHasMore(false);
            }

            const postDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            const resolvedPosts = await resolvePostsData(postDocs);

            if (isLoadMore) {
                setPosts(prev => [...prev, ...resolvedPosts]);
            } else {
                setPosts(resolvedPosts);
            }

        } catch (error) {
            console.error("Error fetching latest posts:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Helper to resolve metadata (copied for client component usage)
    const resolvePostsData = async (postDocs: Post[]) => {
        if (postDocs.length === 0) return [];

        const authorIds = Array.from(new Set(postDocs.map(p => p.authorId)));
        const authors: { [key: string]: { name: string, slug: string } } = {};

        for (const id of authorIds) {
            const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", id), limit(1)));
            if (!userSnap.empty) {
                const userData = userSnap.docs[0].data() as User;
                authors[id] = {
                    name: userData.displayName || userData.email || "95News",
                    slug: getAuthorSlug(userData)
                };
            }
        }

        const catSnap = await getDocs(collection(db, "categories"));
        const categoriesMap: { [key: string]: { name: string, slug: string } } = {};
        catSnap.forEach(doc => {
            const data = doc.data() as Category;
            categoriesMap[doc.id] = { name: data.name, slug: data.slug };
        });

        return postDocs.map(post => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            category: categoriesMap[post.categoryIds?.[0] || ""]?.name || "News",
            categorySlug: categoriesMap[post.categoryIds?.[0] || ""]?.slug || "news",
            author: authors[post.authorId]?.name || "95News",
            authorId: post.authorId,
            authorSlug: authors[post.authorId]?.slug || "95news-author",
            date: formatDate(post.createdAt),
            image: post.featuredImageUrl
        }));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            <div style={{ marginBottom: "3rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "800" }}>Latest <span style={{ color: "var(--accent)" }}>News</span></h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Stay updated with the most recent stories from around the world.</p>
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass" style={{ height: "300px", borderRadius: "var(--radius-md)", animation: "pulse 1.5s infinite" }} />
                    ))}
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem" }}>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>

                    {hasMore && (
                        <div style={{ marginTop: "4rem", textAlign: "center" }}>
                            <button
                                onClick={() => fetchPosts(true)}
                                disabled={loadingMore}
                                className="btn btn-outline"
                                style={{ padding: "1rem 3rem", fontSize: "1rem" }}
                            >
                                {loadingMore ? "Loading..." : "Load More Stories"}
                            </button>
                        </div>
                    )}

                    {!hasMore && posts.length > 0 && (
                        <p style={{ textAlign: "center", marginTop: "4rem", color: "var(--text-muted)" }}>You've reached the end of the latest stories.</p>
                    )}
                </>
            )}

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
