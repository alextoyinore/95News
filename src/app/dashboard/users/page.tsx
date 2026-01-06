"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, limit, startAfter, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { User as FirestoreUser } from "@/types/firestore";
import { Search, Shield, User as UserIcon, Mail } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import DashboardPagination from "@/components/DashboardPagination";

export default function UserManagementPage() {
    const { userRecord } = useAuth();
    const [users, setUsers] = useState<FirestoreUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);

    useEffect(() => {
        fetchTotalCount();
        fetchUsers(1, null, itemsPerPage);
    }, [itemsPerPage]);

    const fetchTotalCount = async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "users"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchUsers = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy("email", "asc"),
                limit(limitCount + 1)
            ];

            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "users"), ...constraints);
            const snap = await getDocs(q);
            const docs = snap.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({ id: doc.id, ...doc.data() } as FirestoreUser));

            setUsers(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1]);
            setCurrentPage(page);

            // Update page tokens for back navigation
            if (!pageTokens[page]) {
                const newTokens = [...pageTokens];
                newTokens[page] = docs[items.length - 1];
                setPageTokens(newTokens);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (hasNextPage && lastDoc) {
            fetchUsers(currentPage + 1, lastDoc, itemsPerPage);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prevToken = pageTokens[currentPage - 2];
            fetchUsers(currentPage - 1, prevToken, itemsPerPage);
        }
    };

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setPageTokens([null]); // Reset tokens when changing page size
    };

    const handleRoleChange = async (userId: string, newRole: FirestoreUser['role']) => {
        if (!confirm(`Change user role to ${newRole}?`)) return;

        setUpdating(userId);
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("Role updated successfully!");
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>User Management</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage permissions and access levels for staff and readers.</p>
                </div>
            </div>

            <div style={{ marginBottom: "2rem", position: "relative", maxWidth: "400px" }}>
                <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0.8rem 1rem 0.8rem 2.8rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)"
                    }}
                />
            </div>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ overflowX: "auto", flex: 1 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>User</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>Current Role</th>
                                <th style={{ padding: "1.2rem 1.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                                        Loading User Directory...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", transition: "background-color 0.2s ease" }}>
                                        <td style={{ padding: "1.2rem 1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                {u.photoURL ? (
                                                    <img src={u.photoURL} alt={u.displayName} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--border)" }} />
                                                ) : (
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <UserIcon size={20} color="var(--text-muted)" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: "700" }}>{u.displayName || "Anonymous User"}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                        <Mail size={12} />
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1.5rem" }}>
                                            <div style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.4rem",
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                backgroundColor: u.role === 'superuser' ? "rgba(239, 68, 68, 0.1)" :
                                                    u.role === 'editor' ? "rgba(16, 185, 129, 0.1)" :
                                                        u.role === 'writer' ? "rgba(59, 130, 246, 0.1)" :
                                                            u.role === 'contributor' ? "rgba(245, 158, 11, 0.1)" : "rgba(107, 114, 128, 0.1)",
                                                color: u.role === 'superuser' ? "#ef4444" :
                                                    u.role === 'editor' ? "#10b981" :
                                                        u.role === 'writer' ? "#3b82f6" :
                                                            u.role === 'contributor' ? "#f59e0b" : "var(--text-secondary)"
                                            }}>
                                                {u.role === 'superuser' && <Shield size={12} />}
                                                {u.role}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1.5rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <select
                                                    value={u.role}
                                                    disabled={updating === u.id || userRecord?.id === u.id}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value as FirestoreUser['role'])}
                                                    style={{
                                                        padding: "0.4rem 0.6rem",
                                                        borderRadius: "var(--radius-sm)",
                                                        border: "1px solid var(--border)",
                                                        backgroundColor: "var(--bg-secondary)",
                                                        color: "var(--text-primary)",
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    <option value="subscriber">Subscriber</option>
                                                    <option value="contributor">Contributor</option>
                                                    <option value="writer">Writer</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="superuser">Superuser</option>
                                                </select>
                                                {updating === u.id && <span style={{ fontSize: "0.7rem", color: "var(--accent)" }}>Saving...</span>}
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
                    onNext={handleNextPage}
                    onPrev={handlePrevPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>
        </div>
    );
}
