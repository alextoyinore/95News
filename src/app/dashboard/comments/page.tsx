"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter, updateDoc, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardPagination from "@/components/DashboardPagination";

export default function CommentsPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    useEffect(() => {
        fetchTotalCount();
        fetchComments(1, null, itemsPerPage);
    }, []);

    const fetchTotalCount = async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "comments"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchComments = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy("createdAt", "desc"),
                limit(limitCount + 1)
            ];
            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "comments"), ...constraints);

            const snap = await getDocs(q);
            const docs = snap.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setComments(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        fetchComments(1, null, newLimit);
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchComments(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchComments(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, "comments", id), { status });
            setComments(comments.map(c => c.id === id ? { ...c, status } : c));
        } catch (error) {
            console.error("Error updating comment status:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "comments", id));
            fetchTotalCount();
            fetchComments(currentPage, pageTokens[currentPage], itemsPerPage);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return '-';
        if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
        return new Date(date).toLocaleDateString();
    };

    if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading comments...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Comments</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage user feedback and moderations.</p>
                </div>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Comment</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Post</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Date</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    No comments found.
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}>{comment.authorName || comment.author}</div>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{comment.content}</div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", fontSize: "0.9rem" }}>{comment.postTitle || "Unknown post"}</td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <span style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            color: comment.status === "approved" ? "#10b981" : comment.status === "pending" ? "#f59e0b" : "#ef4444",
                                            textTransform: "capitalize"
                                        }}>
                                            {comment.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{formatDate(comment.createdAt || comment.date)}</td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "0.8rem" }}>
                                            <button onClick={() => handleUpdateStatus(comment.id, "approved")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Approve">✅</button>
                                            <button onClick={() => handleUpdateStatus(comment.id, "spam")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Spam">🚫</button>
                                            <button onClick={() => handleDelete(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Delete">🗑️</button>
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
