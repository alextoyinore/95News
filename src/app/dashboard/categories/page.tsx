"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, limit, startAfter, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    useEffect(() => {
        fetchTotalCount();
        fetchCategories(1, null, itemsPerPage);
    }, []);

    const fetchTotalCount = async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "categories"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchCategories = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy("name"),
                limit(limitCount + 1)
            ];
            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "categories"), ...constraints);

            const snap = await getDocs(q);
            const docs = snap.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];

            setCategories(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        fetchCategories(1, null, newLimit);
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchCategories(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchCategories(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            await addDoc(collection(db, "categories"), {
                name: newCategoryName,
                slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                posts: 0 // Initialize post count logic later or aggregation
            });
            setNewCategoryName("");
            setShowAddModal(false);
            fetchTotalCount();
            fetchCategories(1, null, itemsPerPage);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Failed to add category.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteDoc(doc(db, "categories", id));
                fetchTotalCount();
                fetchCategories(currentPage, pageTokens[currentPage], itemsPerPage);
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category.");
            }
        }
    };

    if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading categories...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Categories</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage content categories and hierarchy.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    style={{ gap: "0.5rem" }}
                >
                    <Plus size={18} /> Add New Category
                </button>
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
                        <h3 style={{ marginBottom: "1.5rem" }}>Add New Category</h3>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
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
                            <button className="btn btn-primary" onClick={handleAddCategory}>Add Category</button>
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
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Posts Count</th>
                            <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}>{cat.name}</div>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-secondary)" }}>/{cat.slug}</td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{0} articles</span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }} title="Edit">
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
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
