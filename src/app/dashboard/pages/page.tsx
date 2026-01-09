"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter, QueryConstraint, getCountFromServer, where, updateDoc } from "firebase/firestore";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchDebounce, setSearchDebounce] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchTotalCount();
        fetchPages(1, null, itemsPerPage);
    }, [itemsPerPage, statusFilter, searchDebounce]);

    const fetchTotalCount = async () => {
        try {
            if (statusFilter !== 'all' || searchDebounce) {
                setTotalItems(0);
                return;
            }
            const snapshot = await getCountFromServer(collection(db, "pages"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchPages = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [];

            if (searchDebounce) {
                const slugStart = searchDebounce.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                constraints.push(orderBy("slug"));
                constraints.push(where("slug", ">=", slugStart));
                constraints.push(where("slug", "<=", slugStart + '\uf8ff'));
            } else {
                constraints.push(orderBy("updatedAt", "desc"));
            }

            if (statusFilter !== 'all') {
                constraints.push(where("status", "==", statusFilter));
            }

            constraints.push(limit(limitCount + 1));

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

            if (page === 1) {
                setPageTokens([null]);
            } else if (page > pageTokens.length - 1) {
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
        // fetchPages triggered by effect
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

    const handleStatusChange = async (pageObj: Page, newStatus: 'draft' | 'published') => {
        try {
            await updateDoc(doc(db, "pages", pageObj.id), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            // Update local state
            setPages(pages.map(p => p.id === pageObj.id ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading pages...</div>;

    return (
        <div>
            <div className="dashboard-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Pages</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage your static pages.</p>
                </div>
                <Link href="/dashboard/pages/new" className="btn btn-primary">
                    + Create New Page
                </Link>
            </div>

            {/* Filters */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        type="text"
                        placeholder="Search pages..."
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
                                        <select
                                            value={page.status}
                                            onChange={(e) => handleStatusChange(page, e.target.value as any)}
                                            style={{
                                                padding: "0.4rem 0.6rem",
                                                borderRadius: "var(--radius-sm)",
                                                border: "1px solid var(--border)",
                                                backgroundColor: "var(--bg-secondary)",
                                                color: page.status === "published" ? "#10b981" : "#f59e0b",
                                                fontWeight: "600",
                                                fontSize: "0.85rem",
                                                outline: "none",
                                                cursor: "pointer",
                                                textTransform: "capitalize"
                                            }}
                                        >
                                            <option value="published" style={{ color: "#10b981" }}>Published</option>
                                            <option value="draft" style={{ color: "#f59e0b" }}>Draft</option>
                                        </select>
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
