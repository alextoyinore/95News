"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter, QueryConstraint, getCountFromServer, where, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";
import { Search, Star, Zap } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchDebounce, setSearchDebounce] = useState("");
    const [featuredTagId, setFeaturedTagId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const init = async () => {
            await ensureFeaturedTag();
            await fetchTotalCount();
            await fetchPosts(1, null, itemsPerPage);
        };
        init();
    }, [itemsPerPage, statusFilter, searchDebounce]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const ensureFeaturedTag = async () => {
        try {
            const q = query(collection(db, "tags"), where("slug", "==", "featured"));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setFeaturedTagId(snapshot.docs[0].id);
            } else {
                // Create it if it doesn't exist
                const docRef = await addDoc(collection(db, "tags"), {
                    name: "Featured",
                    slug: "featured"
                });
                setFeaturedTagId(docRef.id);
            }
        } catch (error) {
            console.error("Error ensuring featured tag:", error);
        }
    };

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
            if (statusFilter !== 'all' || searchDebounce) {
                // Hide pagination count for now in filtered view
                setTotalItems(0);
                return;
            }

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
            const constraints: QueryConstraint[] = [];

            if (searchDebounce) {
                const slugStart = searchDebounce.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                constraints.push(orderBy("slug"));
                constraints.push(where("slug", ">=", slugStart));
                constraints.push(where("slug", "<=", slugStart + '\uf8ff'));
            } else {
                constraints.push(orderBy("createdAt", "desc"));
            }

            if (statusFilter !== 'all') {
                constraints.push(where("status", "==", statusFilter));
            }

            constraints.push(limit(limitCount + 1));

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

            if (page === 1) {
                setPageTokens([null]);
            } else if (page > pageTokens.length - 1) {
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
        // fetchPosts triggered by effect
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

    // Toggle handlers
    const handleToggleAttribute = async (post: Post, attribute: 'isFeatured' | 'isBreaking') => {

        if (attribute === 'isBreaking') {
            const newValue = !post.isBreaking;
            // Optimistic update
            setPosts(posts.map(p => p.id === post.id ? { ...p, isBreaking: newValue } : p));
            try {
                await updateDoc(doc(db, "posts", post.id), {
                    isBreaking: newValue
                });
            } catch (error) {
                console.error("Error updating isBreaking:", error);
                setPosts(posts.map(p => p.id === post.id ? { ...p, isBreaking: post.isBreaking } : p));
                alert("Failed to update Breaking status.");
            }
            return;
        }

        // Handle Featured as Tag
        if (attribute === 'isFeatured') {
            if (!featuredTagId) {
                alert("Featured tag not initialized yet.");
                return;
            }
            const currentTags = post.tagIds || [];
            const isCurrentlyFeatured = currentTags.includes(featuredTagId);
            let newTags;
            if (isCurrentlyFeatured) {
                newTags = currentTags.filter(id => id !== featuredTagId);
            } else {
                newTags = [...currentTags, featuredTagId];
            }

            // Optimistic update
            setPosts(posts.map(p => p.id === post.id ? { ...p, tagIds: newTags } : p));

            try {
                await updateDoc(doc(db, "posts", post.id), {
                    tagIds: newTags
                });
            } catch (error) {
                console.error("Error updating featured tag:", error);
                setPosts(posts.map(p => p.id === post.id ? { ...p, tagIds: currentTags, isFeatured: isCurrentlyFeatured } : p));
                alert("Failed to update Featured status.");
            }
        }
    };

    const handleStatusChange = async (post: Post, newStatus: 'draft' | 'published' | 'archived') => {
        const oldStatus = post.status;

        // Optimistic update
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));

        try {
            const updateData: any = {
                status: newStatus,
                updatedAt: new Date().toISOString()
            };

            // If moving to published, set publishedAt if not already set
            if (newStatus === 'published' && !post.publishedAt) {
                updateData.publishedAt = new Date().toISOString();
            }

            await updateDoc(doc(db, "posts", post.id), updateData);
        } catch (error) {
            console.error("Error updating status:", error);
            // Rollback on error
            setPosts(posts.map(p => p.id === post.id ? { ...p, status: oldStatus } : p));
            alert("Failed to update post status.");
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

            {/* Filters */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "0.7rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", outline: "none" }}
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Title</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Category</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600", textAlign: "center" }}>Featured</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600", textAlign: "center" }}>Breaking</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Date</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
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
                                        <select
                                            value={post.status}
                                            onChange={(e) => handleStatusChange(post, e.target.value as any)}
                                            style={{
                                                padding: "0.4rem 0.6rem",
                                                borderRadius: "var(--radius-sm)",
                                                border: "1px solid var(--border)",
                                                backgroundColor: "var(--bg-secondary)",
                                                color: post.status === "published" ? "#10b981" : post.status === "draft" ? "#f59e0b" : "#ef4444",
                                                fontWeight: "600",
                                                fontSize: "0.85rem",
                                                outline: "none",
                                                cursor: "pointer",
                                                textTransform: "capitalize"
                                            }}
                                        >
                                            <option value="published" style={{ color: "#10b981" }}>Published</option>
                                            <option value="draft" style={{ color: "#f59e0b" }}>Draft</option>
                                            <option value="archived" style={{ color: "#ef4444" }}>Archived</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleToggleAttribute(post, 'isFeatured')}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: (featuredTagId && post.tagIds?.includes(featuredTagId)) ? "#fbbf24" : "var(--text-disabled)",
                                                transition: "color 0.2s"
                                            }}
                                            title="Toggle Featured"
                                        >
                                            <Star size={20} fill={(featuredTagId && post.tagIds?.includes(featuredTagId)) ? "#fbbf24" : "none"} />
                                        </button>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleToggleAttribute(post, 'isBreaking')}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: post.isBreaking ? "#ef4444" : "var(--text-disabled)",
                                                transition: "color 0.2s"
                                            }}
                                            title="Toggle Breaking News"
                                        >
                                            <Zap size={20} fill={post.isBreaking ? "#ef4444" : "none"} />
                                        </button>
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
