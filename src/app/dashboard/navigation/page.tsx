"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, where } from "firebase/firestore";
import { NavigationMenu, NavigationMenuItem } from "@/types/firestore";
import { Plus, Trash2, GripVertical, Settings, Link as LinkIcon, FileText, Layers, Save } from "lucide-react";

export default function NavigationPage() {
    const [menus, setMenus] = useState<NavigationMenu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<NavigationMenu | null>(null);
    const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newMenuName, setNewMenuName] = useState("");

    useEffect(() => {
        fetchMenus();
    }, []);

    useEffect(() => {
        if (selectedMenu) {
            fetchMenuItems(selectedMenu.id);
        }
    }, [selectedMenu]);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "menus"));
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavigationMenu));
            setMenus(items);
            if (items.length > 0 && !selectedMenu) {
                setSelectedMenu(items[0]);
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItems = async (menuId: string) => {
        try {
            const q = query(collection(db, "menuItems"), where("menuId", "==", menuId));
            const snap = await getDocs(q);
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavigationMenuItem))
                .sort((a, b) => a.order - b.order);
            setMenuItems(items);
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    const handleCreateMenu = async () => {
        if (!newMenuName.trim()) return;
        setSaving(true);
        try {
            const docRef = await addDoc(collection(db, "menus"), {
                name: newMenuName,
                slug: newMenuName.toLowerCase().replace(/\s+/g, '-'),
                createdAt: new Date().toISOString()
            });
            const newMenu = { id: docRef.id, name: newMenuName };
            setMenus([...menus, newMenu as NavigationMenu]);
            setSelectedMenu(newMenu as NavigationMenu);
            setMenuItems([]);
            setIsCreating(false);
            setNewMenuName("");
        } catch (error) {
            console.error("Error creating menu:", error);
            alert("Failed to create menu.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddMenuItem = () => {
        if (!selectedMenu) return;
        const newItem: NavigationMenuItem = {
            id: `temp-${Date.now()}`,
            menuId: selectedMenu.id,
            label: "New Menu Item",
            type: 'custom',
            url: "/",
            order: menuItems.length
        };
        setMenuItems([...menuItems, newItem]);
    };

    const handleUpdateItem = (id: string, updates: Partial<NavigationMenuItem>) => {
        setMenuItems(menuItems.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleRemoveItem = (id: string) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        if (!selectedMenu) return;
        setSaving(true);
        try {
            // This is a simplified bulk save. 
            // In a real app, we'd compare and only update changed/new/deleted docs.
            // For now, let's just update the ones in state.
            for (const item of menuItems) {
                const { id, ...data } = item;
                if (id.startsWith('temp-')) {
                    await addDoc(collection(db, "menuItems"), data);
                } else {
                    await updateDoc(doc(db, "menuItems", id), data);
                }
            }
            alert("Menu saved successfully!");
            fetchMenuItems(selectedMenu.id);
        } catch (error) {
            console.error("Error saving menu:", error);
            alert("Failed to save menu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem" }}>Loading Menus...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Navigation Management</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Build and organize your site's header and footer menus.</p>
                </div>
                {selectedMenu && (
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Menu"}
                    </button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
                {/* Menu List */}
                <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", height: "fit-content" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem", fontWeight: "700" }}>Menus</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {menus.map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedMenu(menu)}
                                style={{
                                    textAlign: "left",
                                    padding: "0.8rem 1rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: selectedMenu?.id === menu.id ? "var(--bg-tertiary)" : "transparent",
                                    color: selectedMenu?.id === menu.id ? "var(--accent)" : "var(--text-primary)",
                                    fontWeight: selectedMenu?.id === menu.id ? "700" : "400",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                {menu.name}
                            </button>
                        ))}
                        {isCreating ? (
                            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <input
                                    type="text"
                                    placeholder="Menu Name (e.g. Header)"
                                    value={newMenuName}
                                    autoFocus
                                    onChange={(e) => setNewMenuName(e.target.value)}
                                    style={{
                                        padding: "0.6rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--accent)",
                                        backgroundColor: "var(--bg-primary)",
                                        color: "var(--text-primary)",
                                        fontSize: "0.85rem"
                                    }}
                                />
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={handleCreateMenu}
                                        disabled={saving || !newMenuName.trim()}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem" }}
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="btn"
                                        style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", border: "1px solid var(--border)" }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                style={{
                                    padding: "0.8rem 1rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px dashed var(--border)",
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    marginTop: "1rem"
                                }}
                            >
                                + Create New Menu
                            </button>
                        )}
                    </div>
                </div>

                {/* MenuItem Management */}
                <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                    {!selectedMenu ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                            Select a menu to manage its items.
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{selectedMenu.name} Items</h2>
                                <button
                                    onClick={handleAddMenuItem}
                                    className="btn"
                                    style={{ border: "1px solid var(--border)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {menuItems.map((item, index) => (
                                    <div key={item.id} className="glass" style={{
                                        padding: "1rem",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--border)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        backgroundColor: "var(--bg-secondary)"
                                    }}>
                                        <GripVertical size={18} style={{ color: "var(--text-muted)", cursor: "grab" }} />

                                        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "700", textTransform: "uppercase" }}>Label</div>
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                                                />
                                            </div>
                                            <div style={{ width: "150px" }}>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "700", textTransform: "uppercase" }}>Type</div>
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as any })}
                                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                                                >
                                                    <option value="custom">Custom Link</option>
                                                    <option value="page">Page</option>
                                                    <option value="category">Category</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1.5 }}>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "700", textTransform: "uppercase" }}>URL / Target</div>
                                                <input
                                                    type="text"
                                                    value={item.url || ""}
                                                    placeholder={item.type === 'custom' ? "e.g. https://..." : "Search object..."}
                                                    onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {menuItems.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
                                        This menu is currently empty.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
