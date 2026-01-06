"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewPagePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState<any>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [saving, setSaving] = useState(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Basic slug generation: lower case, replace spaces/specials with dashes
        if (!slug || slug === title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')) {
            setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
        }
    };

    const handleContentChange = (newContent: any) => {
        setContent(newContent);
    };

    const handleSave = async (selectedStatus: 'draft' | 'published') => {
        if (!title) {
            alert('Please enter a title');
            return;
        }

        setSaving(true);
        try {
            const pageData = {
                title,
                slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                content: JSON.stringify(content),
                status: selectedStatus,
                authorId: 'user-1', // Placeholder
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Default values for fields not yet in UI
                showTitle: true,
                builderEnabled: false
            };

            await addDoc(collection(db, 'pages'), pageData);
            router.push('/dashboard/pages');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Failed to save page.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: "1200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <Link href="/dashboard/pages" style={{ fontSize: "0.9rem", color: "var(--accent)", textDecoration: "none", display: "block", marginBottom: "0.5rem" }}>
                        ← Back to Pages
                    </Link>
                    <h1>Create New Page</h1>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        className="btn"
                        onClick={() => handleSave('draft')}
                        style={{ border: "1px solid var(--border)" }}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSave('published')}
                        disabled={saving}
                    >
                        {saving ? 'Publishing...' : 'Publish Page'}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "2rem" }}>
                {/* Editor Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)" }}>
                        <textarea
                            placeholder="Page Title..."
                            value={title}
                            onChange={(e) => {
                                handleTitleChange(e);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            rows={1}
                            style={{
                                width: "100%",
                                fontSize: "2.5rem",
                                fontWeight: "800",
                                border: "none",
                                outline: "none",
                                backgroundColor: "transparent",
                                marginBottom: "1rem",
                                fontFamily: "var(--font-heading)",
                                resize: "none",
                                overflow: "hidden"
                            }}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                            <span>Slug:</span>
                            <div style={{ display: "flex", alignItems: "center", backgroundColor: "var(--bg-tertiary)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                                <span>/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "inherit",
                                        fontSize: "inherit",
                                        outline: "none",
                                        width: "100%"
                                    }}
                                />
                            </div>
                        </div>

                        <Editor holder="editorjs-new-page" onChange={handleContentChange} />
                    </div>
                </div>

                {/* Sidebar Panel */}
                <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Status & Visibility</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                                <span style={{ fontWeight: "600", color: status === 'published' ? "#10b981" : "#f59e0b", textTransform: 'capitalize' }}>{status}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Visibility:</span>
                                <span style={{ fontWeight: "600" }}>Public</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Page Attributes</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Parent Page</label>
                                <select style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}>
                                    <option>(no parent)</option>
                                    <option>About Us</option>
                                    <option>Contact</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Template</label>
                                <select style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}>
                                    <option>Default Template</option>
                                    <option>Full Width</option>
                                    <option>Contact Page</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
