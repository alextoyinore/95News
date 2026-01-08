"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, limit, startAfter, QueryConstraint, getCountFromServer } from "firebase/firestore";
import { MediaItem } from "@/types/firestore";
import { useAuth } from "@/context/AuthContext";
import { Image as ImageIcon, Upload, Trash2, Link as LinkIcon } from "lucide-react";
import DashboardPagination from "@/components/DashboardPagination";

export default function MediaPage() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [totalItems, setTotalItems] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pageTokens, setPageTokens] = useState<any[]>([null]);
    const { user } = useAuth();

    useEffect(() => {
        fetchTotalCount();
        fetchMedia(1, null, itemsPerPage);
    }, []);

    const fetchTotalCount = async () => {
        try {
            const snapshot = await getCountFromServer(collection(db, "media"));
            setTotalItems(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching count:", error);
        }
    };

    const fetchMedia = async (page: number, startAfterDoc: any, limitCount: number) => {
        setLoading(true);
        try {
            const constraints: QueryConstraint[] = [
                orderBy("createdAt", "desc"),
                limit(limitCount + 1)
            ];
            if (startAfterDoc) {
                constraints.push(startAfter(startAfterDoc));
            }

            const q = query(collection(db, "media"), ...constraints);

            const snap = await getDocs(q);
            const docs = snap.docs;

            const hasNext = docs.length > limitCount;
            const items = docs.slice(0, limitCount).map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MediaItem));

            setMediaItems(items);
            setHasNextPage(hasNext);
            setLastDoc(docs[items.length - 1] || null);

            if (page > pageTokens.length - 1) {
                setPageTokens([...pageTokens, startAfterDoc]);
            }
        } catch (error) {
            console.error("Error fetching media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setPageTokens([null]);
        fetchMedia(1, null, newLimit);
    };

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchMedia(nextPage, lastDoc, itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchMedia(prevPage, pageTokens[prevPage], itemsPerPage);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            // For now, since we don't have the Cloudinary config fully verified, 
            // we'll use a placeholder URL and ask the user to provide the cloud name if they haven't.
            // In a real scenario, we'd use a server action or the Cloudinary Upload Widget.

            // MOCK UPLOAD LOGIC
            // We'll simulate a 2-second upload
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Use a highly professional placeholder
            const placeholderUrl = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80`;

            const newItem: Omit<MediaItem, 'id'> = {
                url: placeholderUrl,
                filename: file.name,
                authorId: user.uid,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "media"), newItem);
            alert("Upload successful (using placeholder).");
            fetchTotalCount();
            fetchMedia(1, null, itemsPerPage);
            setCurrentPage(1);

        } catch (error) {
            console.error("Error uploading media:", error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteDoc(doc(db, "media", id));
            fetchTotalCount();
            fetchMedia(currentPage, pageTokens[currentPage], itemsPerPage);
        } catch (error) {
            console.error("Error deleting media:", error);
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    if (loading) return <div style={{ padding: "2rem" }}>Loading Media...</div>;

    return (
        <div>
            <div className="dashboard-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Media Library</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage your images and assets.</p>
                </div>
                <label className="btn btn-primary" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Upload size={18} />
                    {uploading ? "Uploading..." : "Upload New"}
                    <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
                </label>
            </div>

            <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                {mediaItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                        <ImageIcon size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                        <p>No media items found. Upload your first image!</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "1.5rem"
                    }}>
                        {mediaItems.map((item) => (
                            <div key={item.id} className="media-card" style={{
                                position: "relative",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                aspectRatio: "1/1",
                                border: "1px solid var(--border)"
                            }}>
                                <img
                                    src={item.url}
                                    alt={item.filename}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <div className="media-overlay" style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "rgba(0,0,0,0.6)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "0.8rem",
                                    opacity: 0,
                                    transition: "opacity 0.2s ease"
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                                >
                                    <button
                                        onClick={() => handleCopyLink(item.url)}
                                        title="Copy Link"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.9)",
                                            color: "black",
                                            border: "none",
                                            padding: "0.6rem",
                                            borderRadius: "50%",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <LinkIcon size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete"
                                        style={{
                                            background: "rgba(239, 68, 68, 0.9)",
                                            color: "white",
                                            border: "none",
                                            padding: "0.6rem",
                                            borderRadius: "50%",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ marginTop: "1rem" }}>
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
