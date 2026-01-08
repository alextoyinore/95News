
"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, orderBy, limit, startAfter, QueryConstraint, getCountFromServer, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/firestore";
import DashboardPagination from "@/components/DashboardPagination";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]); // For parent selection
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchDebounce, setSearchDebounce] = useState("");

    // Restoration of missing state variables
    const [slug, setSlug] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [parentId, setParentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchTotalCount();
        fetchAllCategories();
        fetchCategories(1, null, itemsPerPage);
    }, []);

    useEffect(() => {
        if (currentPage === 1) { // Only refetch on debounce if we are reset or it's a new search
            fetchTotalCount();
            fetchAllCategories();
            fetchCategories(1, null, itemsPerPage);
        }
    }, [searchDebounce]);

    // Use effect for pagination change
    // This is tricky with the dual effect. Let's simplify:
    // Actually, let's just trigger fetch inside handlers and effects properly.
    // The previous implementation had a direct call.
    // Let's just keep the initial load and rely on handlers for pagination, 
    // and effect for search debounce.

    const fetchTotalCount = async () => {
        try {
            if (searchDebounce) {
                setTotalItems(0);
                return;
            }
            const snapshot = await getCountFromServer(collection(db, "categories"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const q = query(collection(db, "categories"), orderBy("name"));
            const snap = await getDocs(q);
            setAllCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        } catch (error) {
            console.error("Error fetching all categories:", error);
        }
    };

    const fetchCategories = async (page: number, startAfterDoc: any, limitCount: number) => {
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

            if (page === 1) {
                setPageTokens([null]);
            } else if (page > pageTokens.length - 1) {
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

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setNewCategoryName(name);
        if (!isSlugManuallyEdited) {
            setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
        setIsSlugManuallyEdited(true);
    };

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setSlug(category.slug);
        setIsSlugManuallyEdited(true); // Treat existing slugs as manually set so they don't auto-update on name edit immediately unless cleared
        setParentId(category.parentId || "");
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (editingCategory) {
            await handleUpdateCategory();
        } else {
            await handleAddCategory();
        }
    };

    const handleUpdateCategory = async () => {
        if (!newCategoryName.trim() || !editingCategory) return;

        try {
            const finalSlug = slug.trim() || newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            await updateDoc(doc(db, "categories", editingCategory.id), {
                name: newCategoryName,
                slug: finalSlug,
                parentId: parentId || null
            });

            setEditingCategory(null);
            setNewCategoryName("");
            setSlug("");
            setIsSlugManuallyEdited(false);
            setParentId("");
            setShowAddModal(false);

            // Refresh current view without resetting page if possible, 
            // but fetching logic relies on cursors, so refetching current page logic is tricky.
            // For simplicity, re-fetch current page or just all categories logic.
            // Let's just refetch everything to be safe and simple.
            fetchTotalCount();
            fetchAllCategories();
            // Try to stay on current page? It's complex with startAfter. 
            // Resetting to page 1 is safest to reflect order changes if name changed.
            fetchCategories(1, null, itemsPerPage);
            setCurrentPage(1);
            setPageTokens([null]);

        } catch (error) {
            console.error("Error updating category:", error);
            alert("Failed to update category.");
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const finalSlug = slug.trim() || newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            await addDoc(collection(db, "categories"), {
                name: newCategoryName,
                slug: finalSlug,
                parentId: parentId || null,
                posts: 0
            });
            setNewCategoryName("");
            setSlug("");
            setIsSlugManuallyEdited(false);
            setParentId("");
            setShowAddModal(false);
            setEditingCategory(null);
            fetchTotalCount();
            fetchAllCategories();
            fetchCategories(1, null, itemsPerPage);
            setCurrentPage(1);
            setPageTokens([null]);
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
                fetchAllCategories();
                fetchCategories(currentPage, pageTokens[currentPage], itemsPerPage);
                setPageTokens([null]);
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category.");
            }
        }
    };

    if (loading && pageTokens.length === 1 && !categories.length) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading categories...</div>;

    const getParentName = (pid?: string) => {
        if (!pid) return "-";
        return allCategories.find(c => c.id === pid)?.name || "-";
    };

    return (
        <div>
            <div className="dashboard-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Categories</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage content categories and hierarchy.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingCategory(null);
                        setNewCategoryName("");
                        setSlug("");
                        setIsSlugManuallyEdited(false);
                        setParentId("");
                        setShowAddModal(true);
                    }}
                    style={{ gap: "0.5rem" }}
                >
                    <Plus size={18} /> Add New Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "28px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                    type="text"
                    placeholder="Search categories..."
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
                        <h3 style={{ marginBottom: "1.5rem" }}>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={handleNameChange}
                                placeholder="e.g. Science"
                                style={{
                                    width: "100%",
                                    padding: "0.8rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    outline: "none",
                                    marginBottom: "1rem"
                                }}
                            />

                            <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={handleSlugChange}
                                placeholder="e.g. science"
                                style={{
                                    width: "100%",
                                    padding: "0.8rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    outline: "none",
                                    marginBottom: "1rem"
                                }}
                            />

                            <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Parent Category (Optional)</label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.8rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    outline: "none"
                                }}
                            >
                                <option value="">None (Top Level)</option>
                                {allCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                            <button className="btn" onClick={() => {
                                setShowAddModal(false);
                                setEditingCategory(null);
                                setNewCategoryName("");
                                setSlug("");
                                setIsSlugManuallyEdited(false);
                                setParentId("");
                            }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingCategory ? "Update Category" : "Add Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div className="table-container">
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Name</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Slug</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Parent</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Posts Count</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
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
                                        <td style={{ padding: "1.2rem 1.5rem", color: "var(--text-secondary)" }}>
                                            {getParentName(cat.parentId)}
                                        </td>
                                        <td style={{ padding: "1.2rem 1.5rem" }}>
                                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{0} articles</span>
                                        </td>
                                        <td style={{ padding: "1.2rem 1.5rem" }}>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                                                    title="Edit"
                                                >
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
                </div>
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
