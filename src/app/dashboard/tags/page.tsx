"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, limit, startAfter, QueryConstraint, getCountFromServer, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tag } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);
    const [searchQuery, setSearchQuery] = useState("");
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
        fetchTags(1, null, itemsPerPage);
    }, [itemsPerPage, searchDebounce]);

    const fetchTotalCount = async () => {
        try {
            if (searchDebounce) {
                setTotalItems(0);
                return;
            }
            const snapshot = await getCountFromServer(collection(db, "tags"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchTags = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [];

            if (searchDebounce) {
                const slugStart = searchDebounce.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                constraints.push(orderBy("slug"));
                constraints.push(where("slug", ">=", slugStart));
                constraints.push(where("slug", "<=", slugStart + '\uf8ff'));
            } else {
                constraints.push(orderBy("name"));
            }

            constraints.push(limit(limitCount + 1));

            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "tags"), ...constraints);

            const snap = await getDocs(q);
            const docs = snap.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Tag[];

            setTags(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page === 1) {
                setPageTokens([null]);
            } else if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        // fetchTags triggered by effect
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchTags(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchTags(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;

        try {
            await addDoc(collection(db, "tags"), {
                name: newTagName,
                slug: newTagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
            });
            setNewTagName("");
            setShowAddModal(false);
            fetchTotalCount();
            fetchTags(1, null, itemsPerPage);
            setCurrentPage(1);
            setPageTokens([null]); // Reset pagination
        } catch (error) {
            console.error("Error adding tag:", error);
            alert("Failed to add tag.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this tag?")) {
            try {
                await deleteDoc(doc(db, "tags", id));
                fetchTotalCount();
                fetchTags(currentPage, pageTokens[currentPage], itemsPerPage);
            } catch (error) {
                console.error("Error deleting tag:", error);
                alert("Failed to delete tag.");
            }
        }
    };

    if (loading && pageTokens.length === 1 && !tags.length) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading tags...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Tags</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage article tags and metadata.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    + Add New Tag
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "28px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
                />
            </div>

            {showAddModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "400px" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>Add New Tag</h3>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Tag Name</label>
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="e.g. Science"
                                style={{
                                    width: "100%",
                                    padding: "0.8rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                            <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddTag}>Add Tag</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Name</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Slug</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Usage Count</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tags.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    No tags found.
                                </td>
                            </tr>
                        ) : (
                            tags.map((tag) => (
                                <tr key={tag.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}># {tag.name}</div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-secondary)" }}>{tag.slug}</td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Used in {0} posts</span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "0.8rem" }}>
                                            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Edit">✏️</button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                                                title="Delete"
                                            >
                                                🗑️
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
