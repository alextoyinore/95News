"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { analyzeSeo, SeoAnalysisResult } from '@/lib/seoAnalyzer';
import { Post } from '@/types/firestore';
import MediaBrowser from '@/components/MediaBrowser';
import { Sparkles } from 'lucide-react';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function NewPostPage() {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<any>(null);
    const [excerpt, setExcerpt] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [audioUrl, setAudioUrl] = useState('');
    const [generateAudio, setGenerateAudio] = useState(false);
    const [isBreaking, setIsBreaking] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [featuredImageCaption, setFeaturedImageCaption] = useState('');
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);
    const [isMediaBrowserOpen, setIsMediaBrowserOpen] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<{ id: string, name: string }[]>([]);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const [seoResult, setSeoResult] = useState<SeoAnalysisResult>({
        score: 0,
        grade: 'F',
        feedback: [],
        tips: []
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            const snap = await getDocs(collection(db, "categories"));
            setAvailableCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        };
        fetchCategories();
    }, []);

    // SEO Helper
    const updateSeo = (t: string, d: string, c: any, k: string) => {
        const result = analyzeSeo(t, d, c, k);
        setSeoResult(result);
    };

    // Handlers
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        updateSeo(newTitle, metaDescription, content, focusKeyword);
    };

    const handleMetaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDesc = e.target.value;
        setMetaDescription(newDesc);
        updateSeo(title, newDesc, content, focusKeyword);
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setFocusKeyword(newKey);
        updateSeo(title, metaDescription, content, newKey);
    };

    const handleContentChange = (newContent: any) => {
        setContent(newContent);
        updateSeo(title, metaDescription, newContent, focusKeyword);
    };

    const handleImageUpload = () => {
        setIsMediaBrowserOpen(true);
    };

    const handleMediaSelect = (item: any) => {
        setFeaturedImage(item.url);
        setIsMediaBrowserOpen(false);
    };

    const generateWithAI = async (type: 'tags' | 'focusKeyword' | 'metaDescription') => {
        if (!title) {
            alert("Please enter a title first.");
            return;
        }

        setGenerating(type);
        try {
            const contentText = content?.blocks ? content.blocks.map((b: any) => b.data.text || '').join(' ') : '';
            const res = await fetch('/api/generate-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content: contentText, type })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (type === 'tags') {
                const newTags = data.result.split(',').map((t: string) => t.trim().toLowerCase());
                setTags([...new Set([...tags, ...newTags])]);
            } else if (type === 'focusKeyword') {
                setFocusKeyword(data.result);
                updateSeo(title, metaDescription, content, data.result);
            } else if (type === 'metaDescription') {
                setMetaDescription(data.result);
                updateSeo(title, data.result, content, focusKeyword);
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Failed to generate with AI.");
        } finally {
            setGenerating(null);
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTags = tagInput
                .split(',')
                .map(t => t.trim())
                .filter(t => t !== '' && !tags.includes(t));

            if (newTags.length > 0) {
                setTags([...tags, ...newTags]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const toggleCategory = (catId: string) => {
        if (categoryIds.includes(catId)) {
            setCategoryIds(categoryIds.filter(id => id !== catId));
        } else {
            setCategoryIds([...categoryIds, catId]);
        }
    };

    const handleCreateCategory = async (name: string) => {
        if (!name.trim()) return;

        try {
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const docRef = await addDoc(collection(db, "categories"), {
                name: name.trim(),
                slug,
                parentId: null,
                posts: 0
            });

            const newCategory = { id: docRef.id, name: name.trim() };
            setAvailableCategories([...availableCategories, newCategory]);
            setCategoryIds([...categoryIds, newCategory.id]);
            setCategorySearch('');
            setShowCategoryDropdown(false);
        } catch (error) {
            console.error("Error creating category:", error);
            alert("Failed to create category");
        }
    };

    // Save Logic
    const handleSave = async (status: 'draft' | 'published') => {
        if (!title) {
            alert('Please enter a title');
            return;
        }

        if (!user) {
            alert('You must be logged in to save a post.');
            return;
        }

        setSaving(true);
        try {
            const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            const titleKeywords = title
                .toLowerCase()
                .split(' ')
                .filter(w => w.length > 3)
                .map(w => w.replace(/[^a-z0-9]/g, ''))
                .filter(w => w !== '');

            // Construct Post data matching Firestore schema
            const postDataRaw = {
                title: title || '',
                slug: slug || '',
                titleKeywords: titleKeywords || [],
                excerpt: excerpt || '',
                focusKeyword: focusKeyword || '',
                metaDescription: metaDescription || '',
                categoryIds: categoryIds || [],
                tagIds: tags || [],
                content: JSON.stringify(content) || '',
                featuredImageUrl: featuredImage || '',
                featuredImageCaption: featuredImageCaption || '',
                audioUrl: audioUrl || '',
                status: status || 'draft',
                authorId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isBreaking: !!isBreaking,
                isFeatured: !!isFeatured,
                views: 0
            };

            // Remove any potential undefined values just in case
            const postData = Object.fromEntries(
                Object.entries(postDataRaw).filter(([_, v]) => v !== undefined)
            );

            await addDoc(collection(db, 'posts'), postData);
            router.push('/dashboard/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: "1400px" }}>
            <div className="post-editor-header">
                <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Write New Story</h1>
                <div className="post-editor-actions">
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
                        {saving ? 'Publishing...' : 'Publish Story'}
                    </button>
                </div>
            </div>

            <div className="post-editor-layout">
                {/* Editor Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ borderRadius: "var(--radius-lg)" }}>
                        <textarea
                            placeholder="Title"
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
                        <Editor holder="editorjs-new-post" onChange={handleContentChange} data={null} />
                    </div>
                </div>

                {/* Sidebar Panel */}
                <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Publishing</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {/* Categories */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Categories</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="text"
                                        placeholder="Search or Create category..."
                                        value={categorySearch}
                                        onChange={(e) => {
                                            setCategorySearch(e.target.value);
                                            setShowCategoryDropdown(true);
                                        }}
                                        onFocus={() => setShowCategoryDropdown(true)}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
                                    />
                                    {showCategoryDropdown && (
                                        <div className="glass" style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            marginTop: "5px",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            zIndex: 200,
                                            borderRadius: "var(--radius-sm)",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                                        }}>
                                            {availableCategories
                                                .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                                .map(cat => (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => {
                                                            toggleCategory(cat.id);
                                                            setCategorySearch('');
                                                            setShowCategoryDropdown(false);
                                                        }}
                                                        style={{
                                                            padding: "0.6rem 1rem",
                                                            cursor: "pointer",
                                                            backgroundColor: categoryIds.includes(cat.id) ? "var(--accent)" : "transparent",
                                                            color: categoryIds.includes(cat.id) ? "white" : "inherit"
                                                        }}
                                                    >
                                                        {cat.name}
                                                    </div>
                                                ))
                                            }
                                            {categorySearch && !availableCategories.some(c => c.name.toLowerCase() === categorySearch.toLowerCase()) && (
                                                <div
                                                    onClick={() => handleCreateCategory(categorySearch)}
                                                    style={{
                                                        padding: "0.6rem 1rem",
                                                        cursor: "pointer",
                                                        color: "var(--accent)",
                                                        fontWeight: "bold",
                                                        borderTop: "1px solid var(--border)"
                                                    }}
                                                >
                                                    + Create "{categorySearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.8rem" }}>
                                    {categoryIds.map(id => {
                                        const cat = availableCategories.find(c => c.id === id);
                                        return cat ? (
                                            <span key={id} style={{
                                                padding: "0.2rem 0.6rem",
                                                backgroundColor: "var(--bg-tertiary)",
                                                borderRadius: "10px",
                                                fontSize: "0.75rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.4rem"
                                            }}>
                                                {cat.name}
                                                <span onClick={() => toggleCategory(id)} style={{ cursor: "pointer", opacity: 0.6 }}>×</span>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tags</label>
                                    {/* AI generation muted for now */}
                                    {/* 
                                    <button
                                        onClick={() => generateWithAI('tags')}
                                        disabled={generating === 'tags'}
                                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", opacity: generating === 'tags' ? 0.5 : 1 }}
                                    >
                                        <Sparkles size={12} /> {generating === 'tags' ? 'Generating...' : 'AI Generate'}
                                    </button>
                                    */}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add tag (Enter or comma)..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
                                />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.8rem" }}>
                                    {tags.map(tag => (
                                        <span key={tag} style={{
                                            padding: "0.2rem 0.6rem",
                                            backgroundColor: "var(--accent)",
                                            color: "white",
                                            borderRadius: "10px",
                                            fontSize: "0.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem"
                                        }}>
                                            #{tag}
                                            <span onClick={() => removeTag(tag)} style={{ cursor: "pointer" }}>×</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Post Settings */}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Make Featured</label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={isFeatured}
                                            onChange={(e) => {
                                                const val = e.target.checked;
                                                setIsFeatured(val);
                                                if (val && !tags.includes('featured')) {
                                                    setTags([...tags, 'featured']);
                                                } else if (!val) {
                                                    setTags(tags.filter(t => t !== 'featured'));
                                                }
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Breaking News</label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={isBreaking}
                                            onChange={(e) => {
                                                const val = e.target.checked;
                                                setIsBreaking(val);
                                                if (val && !tags.includes('breaking news')) {
                                                    setTags([...tags, 'breaking news']);
                                                } else if (!val) {
                                                    setTags(tags.filter(t => t !== 'breaking news'));
                                                }
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>AI Audio</label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={generateAudio}
                                            onChange={(e) => {
                                                if (e.target.checked && (!title || !content?.blocks || content.blocks.length === 0)) {
                                                    alert("Please enter a title and some content before enabling AI Audio.");
                                                    return;
                                                }
                                                setGenerateAudio(e.target.checked);
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                {(generateAudio || audioUrl) && (
                                    <input
                                        type="text"
                                        placeholder="Audio URL (if custom)"
                                        value={audioUrl}
                                        onChange={(e) => setAudioUrl(e.target.value)}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", fontSize: "0.85rem" }}
                                    />
                                )}
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Excerpt</label>
                                <textarea
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", minHeight: "80px" }}
                                    placeholder="Short summary..."
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Featured Image</label>
                                <div
                                    style={{
                                        width: "100%",
                                        height: "150px",
                                        border: "2px dashed var(--border)",
                                        borderRadius: "var(--radius-sm)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        backgroundImage: featuredImage ? `url(${featuredImage})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        marginBottom: "0.5rem"
                                    }}
                                    onClick={handleImageUpload}
                                >
                                    {!featuredImage && <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Upload Image</span>}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Image caption..."
                                    value={featuredImageCaption}
                                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                                    style={{ width: "100%", padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", fontSize: "0.8rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Panel */}
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                            <h3 style={{ fontSize: "1.1rem" }}>SEO Analysis</h3>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: seoResult.score > 80 ? "#10b981" : seoResult.score > 50 ? "#f59e0b" : "#ef4444",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "0.9rem"
                            }}>
                                {seoResult.score}
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Focus Keyword</label>
                                    {/* AI generation muted for now */}
                                    {/* 
                                    <button
                                        onClick={() => generateWithAI('focusKeyword')}
                                        disabled={generating === 'focusKeyword'}
                                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", opacity: generating === 'focusKeyword' ? 0.5 : 1 }}
                                    >
                                        <Sparkles size={12} /> {generating === 'focusKeyword' ? 'Generating...' : 'AI Generate'}
                                    </button>
                                    */}
                                </div>
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
                                    placeholder="e.g. Artificial Intelligence"
                                    value={focusKeyword}
                                    onChange={handleKeywordChange}
                                />
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Meta Description</label>
                                    {/* AI generation muted for now */}
                                    {/* 
                                    <button
                                        onClick={() => generateWithAI('metaDescription')}
                                        disabled={generating === 'metaDescription'}
                                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", opacity: generating === 'metaDescription' ? 0.5 : 1 }}
                                    >
                                        <Sparkles size={12} /> {generating === 'metaDescription' ? 'Generating...' : 'AI Generate'}
                                    </button>
                                    */}
                                </div>
                                <textarea
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", minHeight: "80px" }}
                                    placeholder="Search engine description..."
                                    maxLength={160}
                                    value={metaDescription}
                                    onChange={handleMetaChange}
                                />
                                <div style={{
                                    height: "4px",
                                    width: "100%",
                                    backgroundColor: "var(--bg-tertiary)",
                                    marginTop: "0.5rem",
                                    borderRadius: "2px",
                                    overflow: "hidden"
                                }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(metaDescription.length / 160) * 100}%`,
                                        backgroundColor: metaDescription.length > 160 ? "#ef4444" : metaDescription.length > 120 ? "#10b981" : "#f59e0b",
                                        transition: "width 0.5s ease"
                                    }} />
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.8rem" }}>Suggestions</h4>
                                <ul style={{
                                    fontSize: "0.85rem",
                                    paddingLeft: "1.2rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem"
                                }}>
                                    {seoResult.tips.length > 0 ? (
                                        seoResult.tips.map((tip, idx) => (
                                            <li key={idx} style={{ color: "var(--text-secondary)" }}>{tip}</li>
                                        ))
                                    ) : (
                                        <li style={{ color: "#10b981" }}>Perfect! Content looks great.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <MediaBrowser
                isOpen={isMediaBrowserOpen}
                onClose={() => setIsMediaBrowserOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
}