"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            await fetchTotalCount();
            await fetchPosts(1, null, 10);
        };
        init();
    }, []);

    const fetchCategories = async () => {
        try {
            const snap = await getDocs(collection(db, "categories"));
            const map: Record<string, string> = {};
            snap.docs.forEach(doc => {
                map[doc.id] = doc.data().name;
            });
            setCategoriesMap(map);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchTotalCount = async () => {
        try {
            const coll = collection(db, "posts");
            const snapshot = await getCountFromServer(coll);
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchPosts = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            // Fetch items for current page + 1 to check if next page exists
            const constraints: QueryConstraint[] = [
                orderBy("createdAt", "desc"),
                limit(limitCount + 1)
            ];
            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "posts"), ...constraints);

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[];

            setPosts(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        fetchPosts(1, null, newLimit);
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchPosts(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchPosts(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, "posts", id));
                setPosts(posts.filter(post => post.id !== id));
                // Re-fetch total count after deletion
                await fetchTotalCount();
                // If current page becomes empty, go to previous page
                if (posts.length === 1 && currentPage > 1) {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    fetchPosts(prevPage, pageTokens[prevPage], itemsPerPage);
                } else {
                    // Otherwise, re-fetch current page to ensure correct items
                    fetchPosts(currentPage, pageTokens[currentPage - 1], itemsPerPage);
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
            return new Date(date).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Loading posts...</div>;
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Posts</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage your stories and articles.</p>
                </div>
                <Link href="/dashboard/posts/new" className="btn btn-primary">
                    + Create New Post
                </Link>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Title</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Category</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Date</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    No posts found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} style={{ borderBottom: "1px solid var(--border)", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}>{post.title}</div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                                            {post.categoryIds && post.categoryIds.length > 0 ? (
                                                post.categoryIds.map(id => (
                                                    <span key={id} style={{ fontSize: "0.85rem", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                                                        {categoriesMap[id] || id}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Uncategorized</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <span style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            color: post.status === "published" ? "#10b981" : post.status === "draft" ? "#f59e0b" : "#ef4444",
                                            textTransform: "capitalize"
                                        }}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {formatDate(post.createdAt)}
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "0.8rem" }}>
                                            <Link href={`/dashboard/posts/${post.id}`} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", textDecoration: "none" }} title="Edit">✏️</Link>
                                            <button onClick={() => handleDelete(post.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <DashboardPagination
                    currentPage={currentPage}
                    hasNextPage={hasNextPage}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>
        </div>
    );
}
