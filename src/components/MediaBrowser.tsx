"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { MediaItem } from "@/types/firestore";
import { Search, X, Image as ImageIcon, Check, Upload, Trash2, Calendar, FileText, Maximize } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { addDoc } from 'firebase/firestore';

interface MediaBrowserProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
}

export default function MediaBrowser({ isOpen, onClose, onSelect }: MediaBrowserProps) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
            setMediaItems(items);
        } catch (error) {
            console.error("Error fetching media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                console.error("Cloudinary configuration missing");
                alert("Cloudinary configuration missing. Please check your environment variables.");
                setUploading(false);
                return;
            }

            // 1. Upload to Cloudinary (Unsigned)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            // Optional: Add folder if needed, though usually defined in preset
            // formData.append('folder', '95news'); 

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!cloudRes.ok) {
                const errData = await cloudRes.json();
                throw new Error(errData.error?.message || 'Upload failed');
            }

            const cloudData = await cloudRes.json();
            const imageUrl = cloudData.secure_url;

            // 2. Save to Firestore
            const newItem: Omit<MediaItem, 'id'> = {
                url: imageUrl,
                filename: file.name,
                authorId: user.uid,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "media"), newItem);
            const addedItem = { id: docRef.id, ...newItem } as MediaItem;
            setMediaItems([addedItem, ...mediaItems]);
            setSelectedItem(addedItem);
        } catch (error) {
            console.error("Error uploading media:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const filteredItems = mediaItems.filter(item =>
        item.filename.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
        }}>
            <div className="glass" style={{
                width: "90%",
                maxWidth: "1000px",
                height: "80vh",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid var(--border)"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Select Media</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.6rem 1rem 0.6rem 2.5rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-primary)"
                            }}
                        />
                    </div>
                    <label
                        className="btn btn-primary"
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                    >
                        <Upload size={16} />
                        {uploading ? "Uploading..." : "Upload New"}
                        <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
                    </label>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", borderRight: selectedItem ? "1px solid var(--border)" : "none" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "3rem" }}>Loading gallery...</div>
                        ) : filteredItems.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                                <ImageIcon size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                                <p>No images found.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                                gap: "1rem"
                            }}>
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        style={{
                                            position: "relative",
                                            aspectRatio: "1/1",
                                            borderRadius: "var(--radius-md)",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            border: selectedItem?.id === item.id ? "3px solid var(--accent)" : "1px solid var(--border)",
                                            transition: "all 0.1s ease",
                                            transform: selectedItem?.id === item.id ? "scale(0.96)" : "scale(1)"
                                        }}
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.filename}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        {selectedItem?.id === item.id && (
                                            <div style={{
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px",
                                                backgroundColor: "var(--accent)",
                                                color: "white",
                                                borderRadius: "50%",
                                                padding: "2px"
                                            }}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side Panel */}
                    {selectedItem && (
                        <div style={{
                            width: "300px",
                            backgroundColor: "var(--bg-tertiary)",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5rem",
                            overflowY: "auto",
                            borderLeft: "1px solid var(--border)"
                        }}>
                            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                                <img src={selectedItem.url} alt={selectedItem.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: "700", wordBreak: "break-all" }}>{selectedItem.filename}</h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                        <Calendar size={16} />
                                        <span>
                                            {selectedItem.createdAt ? (() => {
                                                const dt: any = selectedItem.createdAt;
                                                // Handle Firestore Timestamp
                                                if (dt && typeof dt === 'object' && typeof dt.seconds === 'number') {
                                                    return new Date(dt.seconds * 1000).toLocaleDateString();
                                                }
                                                // Handle string or Date object
                                                const dateObj = new Date(dt);
                                                return isNaN(dateObj.getTime()) ? "Unknown Date" : dateObj.toLocaleDateString();
                                            })() : "No Date"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                        <FileText size={16} />
                                        <span>Image / JPG</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                        <Maximize size={16} />
                                        <span>1200 x 800 px</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: "auto" }}>
                                <button
                                    onClick={() => onSelect(selectedItem)}
                                    className="btn btn-primary"
                                    style={{ width: "100%", padding: "0.8rem" }}
                                >
                                    Insert Media
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "1.2rem 1.5rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem"
                }}>
                    <button onClick={onClose} className="btn" style={{ border: "1px solid var(--border)" }}>Cancel</button>
                    <button
                        onClick={() => selectedItem && onSelect(selectedItem)}
                        className="btn btn-primary"
                        disabled={!selectedItem}
                    >
                        Select Image
                    </button>
                </div>
            </div>
        </div>
    );
}
