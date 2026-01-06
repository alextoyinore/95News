"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });
import { analyzeSeo, SeoAnalysisResult } from '@/lib/seoAnalyzer';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types/firestore';
import MediaBrowser from '@/components/MediaBrowser';
import { Sparkles } from 'lucide-react';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const [id] = useState(params.id as string);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [audioUrl, setAudioUrl] = useState('');
    const [generateAudio, setGenerateAudio] = useState(false);
    const [content, setContent] = useState<any>(null);
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [featuredImageCaption, setFeaturedImageCaption] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<string>('');
    const [isBreaking, setIsBreaking] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isLegacy, setIsLegacy] = useState(false);
    const [isMediaBrowserOpen, setIsMediaBrowserOpen] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<{ id: string, name: string }[]>([]);
    const [generating, setGenerating] = useState<string | null>(null);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [seoResult, setSeoResult] = useState<SeoAnalysisResult>({
        score: 0,
        grade: 'F',
        feedback: [],
        tips: []
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const snap = await getDocs(collection(db, "categories"));
            setAvailableCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        };
        fetchCategories();
    }, []);

    const convertToEditorJs = (rawContent: any) => {
        if (!rawContent) return null;

        // If it's already in EditorJS format (has blocks)
        if (rawContent.blocks && Array.isArray(rawContent.blocks)) {
            return rawContent;
        }

        // If it's an HTML string
        if (typeof rawContent === 'string') {
            return {
                time: Date.now(),
                blocks: [
                    {
                        type: "paragraph",
                        data: { text: rawContent }
                    }
                ],
                version: "2.28.2"
            };
        }

        // If it's a Tiptap JSON (has type: 'doc')
        if (rawContent.type === 'doc' && Array.isArray(rawContent.content)) {
            const blocks = rawContent.content.map((node: any) => {
                if (node.type === 'paragraph') {
                    return {
                        type: 'paragraph',
                        data: { text: node.content?.[0]?.text || '' }
                    };
                }
                if (node.type === 'heading') {
                    return {
                        type: 'header',
                        data: { text: node.content?.[0]?.text || '', level: node.attrs?.level || 2 }
                    };
                }
                return null;
            }).filter(Boolean);

            return {
                time: Date.now(),
                blocks,
                version: "2.28.2"
            };
        }

        return null;
    };

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const docRef = doc(db, "posts", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as Post;
                setTitle(data.title);
                setExcerpt(data.excerpt || '');
                setFocusKeyword(data.focusKeyword || '');
                setMetaDescription(data.metaDescription || '');
                setCategoryIds(data.categoryIds || []);
                setTags(data.tagIds || []);
                setAudioUrl(data.audioUrl || '');
                setFeaturedImageCaption(data.featuredImageCaption || '');

                if (data.featuredImageUrl) {
                    setFeaturedImage(data.featuredImageUrl);
                }

                if (data.content) {
                    try {
                        const parsed = JSON.parse(data.content);
                        const migrated = convertToEditorJs(parsed);
                        setContent(migrated);
                    } catch (e) {
                        // If it's actual raw content string (not JSON string)
                        const migrated = convertToEditorJs(data.content);
                        setContent(migrated);
                    }
                }
                setDate(data.createdAt);

                // Trigger initial SEO analysis
                updateSeo(data.title, data.metaDescription || '', data.content ? JSON.parse(data.content) : null, data.focusKeyword || '');
            } else {
                alert("Post not found!");
                router.push('/dashboard/posts');
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            alert("Error fetching post details.");
        } finally {
            setLoading(false);
        }
    };

    const updateSeo = (t: string, d: string, c: any, k: string) => {
        const result = analyzeSeo(t, d, c, k);
        setSeoResult(result);
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

    const handleSave = async (status: 'draft' | 'published') => {
        if (!title) {
            alert('Please enter a title');
            return;
        }

        setSaving(true);
        try {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const titleKeywords = title
                .toLowerCase()
                .split(' ')
                .filter(w => w.length > 3)
                .map(w => w.replace(/[^a-z0-9]/g, ''))
                .filter(w => w !== '');

            const postData: Partial<Post> = {
                title,
                slug,
                titleKeywords,
                excerpt,
                focusKeyword,
                metaDescription,
                categoryIds,
                tagIds: tags,
                content: JSON.stringify(content),
                featuredImageUrl: featuredImage || undefined,
                featuredImageCaption,
                audioUrl,
                isBreaking,
                isFeatured,
                status,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(doc(db, 'posts', id), postData);
            router.push('/dashboard/posts');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post.');
        } finally {
            setSaving(false);
        }
    };

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

    const handleMediaSelect = (item: any) => {
        setFeaturedImage(item.url);
        setIsMediaBrowserOpen(false);
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

    if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading...</div>;

    return (
        <div style={{ maxWidth: "1400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Edit Post</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        className="btn"
                        style={{ border: "1px solid var(--border)" }}
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSave('published')}
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Story'}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "2rem" }}>
                {/* Editor Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                        {isLegacy ? (
                            <div style={{
                                padding: "2rem",
                                textAlign: "center",
                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                                border: "1px solid #f59e0b",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "2rem"
                            }}>
                                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#d97706", marginBottom: "0.5rem" }}>⚠️ Legacy Content Detected</h2>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                    This post was created with an older editor and cannot be edited with the new system.
                                    Please use the legacy editor or create a new post.
                                </p>
                            </div>
                        ) : null}
                        <textarea
                            disabled={isLegacy}
                            placeholder="Post Title..."
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
                                marginBottom: "2rem",
                                fontFamily: "var(--font-heading)",
                                resize: "none",
                                overflow: "hidden",
                                opacity: isLegacy ? 0.6 : 1
                            }}
                        />

                        <div style={{ pointerEvents: isLegacy ? 'none' : 'auto', opacity: isLegacy ? 0.6 : 1 }}>
                            <Editor holder="editorjs-edit-post" onChange={handleContentChange} data={content} />
                        </div>
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
                                        placeholder="Search categories..."
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
                                    <button
                                        onClick={() => generateWithAI('tags')}
                                        disabled={generating === 'tags'}
                                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", opacity: generating === 'tags' ? 0.5 : 1 }}
                                    >
                                        <Sparkles size={12} /> {generating === 'tags' ? 'Generating...' : 'AI Generate'}
                                    </button>
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

                            {/* Featured Image */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Featured Image</label>
                                <div
                                    onClick={() => setIsMediaBrowserOpen(true)}
                                    style={{
                                        height: "160px",
                                        border: "2px dashed var(--border)",
                                        borderRadius: "8px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        position: "relative",
                                        backgroundImage: featuredImage ? `url(${featuredImage})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        marginBottom: "0.5rem"
                                    }}
                                >
                                    {!featuredImage && (
                                        <>
                                            <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️</span>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Click to upload</span>
                                        </>
                                    )}
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

                    {/* SEO Analyzer */}
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>AI SEO Analyzer</h3>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Focus Keyword</label>
                            <input
                                type="text"
                                value={focusKeyword}
                                onChange={handleKeywordChange}
                                placeholder="Main keyword..."
                                style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    fontSize: "0.9rem"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Meta Description</label>
                            <textarea
                                value={metaDescription}
                                onChange={handleMetaChange}
                                placeholder="SEO description..."
                                maxLength={160}
                                style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg-primary)",
                                    fontSize: "0.9rem",
                                    resize: "vertical",
                                    minHeight: "80px"
                                }}
                            />
                            <div style={{ textAlign: "right", fontSize: "0.75rem", color: metaDescription.length > 160 ? "red" : "var(--text-tertiary)", marginTop: "0.25rem" }}>
                                {metaDescription.length}/160
                            </div>
                        </div>

                        <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-secondary)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: "600" }}>SEO Score</span>
                                <span style={{ fontWeight: "800", color: seoResult.grade === 'A' ? '#10b981' : seoResult.grade === 'F' ? '#ef4444' : '#f59e0b' }}>{seoResult.grade} ({seoResult.score}/100)</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${seoResult.score}%`, height: "100%", backgroundColor: seoResult.grade === 'A' ? '#10b981' : seoResult.grade === 'F' ? '#ef4444' : '#f59e0b' }}></div>
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
