"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category } from '@/types/firestore';
import PostCard from './PostCard';
import { formatDate } from '@/lib/utils';

interface RelatedPostsProps {
    categoryId: string;
    currentPostId: string;
}

export default function RelatedPosts({ categoryId, currentPostId }: RelatedPostsProps) {
    const [posts, setPosts] = useState<(Post & { authorName?: string })[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Fetch Category Name
                const catRef = doc(db, "categories", categoryId);
                const catSnap = await getDoc(catRef);
                if (catSnap.exists()) {
                    setCategory({ id: catSnap.id, ...catSnap.data() } as Category);
                }

                // Fetch Related Posts
                const q = query(
                    collection(db, "posts"),
                    where("categoryIds", "array-contains", categoryId),
                    where("status", "==", "published"),
                    limit(4)
                );

                const snap = await getDocs(q);
                const rawPosts = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                    .filter(p => p.id !== currentPostId)
                    .slice(0, 3);

                // Fetch Authors for these posts
                const postsWithAuthors = await Promise.all(rawPosts.map(async (p) => {
                    let authorName = "95News";
                    if (p.authorId) {
                        try {
                            const userRef = doc(db, "users", p.authorId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                authorName = userData.displayName || userData.email || "95News";
                            }
                        } catch (e) {
                            console.error("Error fetching author for related post:", e);
                        }
                    }
                    return { ...p, authorName };
                }));

                setPosts(postsWithAuthors);
            } catch (error) {
                console.error("Error fetching related posts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchRelated();
        }
    }, [categoryId, currentPostId]);

    if (loading) return null;
    if (posts.length === 0) return null;

    return (
        <section style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--border)" }}>
            <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem"
            }}>
                <span style={{ width: "4px", height: "1.2em", background: "var(--accent)", borderRadius: "2px" }}></span>
                More from {category?.name || "this category"}
            </h3>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "2rem"
            }}>
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={{
                            id: post.id,
                            slug: post.slug,
                            title: post.title,
                            excerpt: post.excerpt,
                            category: category?.name || "News",
                            author: post.authorName || "95News",
                            authorId: post.authorId,
                            date: formatDate(post.createdAt),
                            image: post.featuredImageUrl
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
