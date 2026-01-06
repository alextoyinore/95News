"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Page } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";

export default function PagesListPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    useEffect(() => {
        fetchTotalCount();
        fetchPages(1, null, itemsPerPage);
    }, []);

    const fetchTotalCount = async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "pages"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchPages = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy("updatedAt", "desc"),
                limit(limitCount + 1)
            ];
            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "pages"), ...constraints);
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Page[];

            setPages(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching pages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        fetchPages(1, null, newLimit);
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchPages(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchPages(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return '-';
        try {
            // Handle Firestore Timestamp
            if (date?.seconds) {
                return new Date(date.seconds * 1000).toLocaleDateString();
            }
            // Handle ISO String
            return new Date(date).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this page?")) {
            try {
                await deleteDoc(doc(db, "pages", id));
                fetchTotalCount();
                fetchPages(currentPage, pageTokens[currentPage], itemsPerPage);
            } catch (error) {
                console.error("Error deleting page:", error);
                alert("Failed to delete page.");
            }
        }
    };

    if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading pages...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Pages</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage static content and legal pages.</p>
                </div>
                <Link href="/dashboard/pages/new" className="btn btn-primary" style={{ gap: "0.5rem" }}>
                    <Plus size={18} /> Create New Page
                </Link>
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Page Title</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Slug</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Last Modified</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    No pages found.
                                </td>
                            </tr>
                        ) : (
                            pages.map((page) => (
                                <tr key={page.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}>{page.title}</div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-secondary)" }}>/{page.slug}</td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <span style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            color: page.status === "published" ? "#10b981" : "#f59e0b",
                                            textTransform: "capitalize"
                                        }}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {formatDate(page.updatedAt || page.createdAt)}
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <Link href={`/dashboard/pages/${page.id}`} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }} title="Edit">
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
