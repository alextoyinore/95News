"use client";

import React, { useState, useEffect } from 'react';
import { getLayoutSettings, LayoutSettings } from '@/lib/layoutActions';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const initialTemplates = [
    { id: 'magazine', name: "Magazine Grid", icon: "📰", description: "Classic news layout with a large hero slider and categorized sections." },
    { id: 'classic', name: "Classic List", icon: "📝", description: "Minimalist list-based layout focused on readability and chronological order." },
    { id: 'modern', name: "Modern Cards", icon: "🃏", description: "Visual-heavy card layout perfect for lifestyle and photography blogs." },
];

const initialWidgets = [
    { id: 'w1', name: 'Social Sidebar', active: true },
    { id: 'w2', name: 'Newsletter Signup', active: true },
    { id: 'w3', name: 'Most Read Posts', active: true },
    { id: 'w4', name: 'Trending Tags', active: false },
    { id: 'w5', name: 'Author Spotlight', active: false },
];

export default function LayoutBuilderPage() {
    const [activeTemplateId, setActiveTemplateId] = useState('magazine');
    const [homePageId, setHomePageId] = useState<string | null>(null);
    const [pages, setPages] = useState<any[]>([]);
    const [widgets, setWidgets] = useState(initialWidgets);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch Pages for selector
                const pagesSnap = await getDocs(query(collection(db, "pages"), where("status", "==", "published")));
                setPages(pagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const settings = await getLayoutSettings();
                if (settings) {
                    setActiveTemplateId(settings.activeTemplateId || 'magazine');
                    setHomePageId(settings.homePageId || null);
                    if (settings.widgets && settings.widgets.length > 0) {
                        setWidgets(settings.widgets);
                    }
                }
            } catch (error) {
                console.error("Failed to load layout settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSelectTemplate = (id: string) => {
        setActiveTemplateId(id);
    };

    const toggleWidget = (id: string) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, active: !w.active } : w));
    };

    const handleSaveLayout = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const docRef = doc(db, "site_settings", "home_layout");
            await setDoc(docRef, {
                activeTemplateId,
                homePageId: homePageId || null,
                widgets,
                lastUpdated: serverTimestamp()
            }, { merge: true });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save layout settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const activeTemplate = initialTemplates.find(t => t.id === activeTemplateId);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <p>Loading Layout Settings...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem" }}>Layout Builder</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Customize how your homepage and categories look to your readers.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {saveSuccess && <span style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: "600" }}>✓ Settings Saved</span>}
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveLayout}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Layout Settings"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Template Selection */}
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>Choose a Base Template</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                            {initialTemplates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template.id)}
                                    style={{
                                        padding: "1.5rem",
                                        borderRadius: "var(--radius-md)",
                                        border: activeTemplateId === template.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                                        backgroundColor: activeTemplateId === template.id ? "var(--bg-tertiary)" : "transparent",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{template.icon}</div>
                                    <div style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>{template.name}</div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{template.description}</p>
                                    {activeTemplateId === template.id && (
                                        <div style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            backgroundColor: "var(--accent)",
                                            color: "white",
                                            fontSize: "0.6rem",
                                            padding: "2px 6px",
                                            borderRadius: "10px",
                                            fontWeight: "700"
                                        }}>
                                            ACTIVE
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Template Preview/Config */}
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>{activeTemplate?.name} Configuration</h3>
                        <div style={{
                            aspectRatio: "16/9",
                            backgroundColor: "var(--bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            border: "1px dashed var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)"
                        }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛠️</div>
                                <p>Visual Layout Preview for <strong>{activeTemplate?.name}</strong></p>
                                <p style={{ fontSize: "0.80rem", marginTop: "1rem", maxWidth: "400px", margin: "1rem auto" }}>
                                    Drag and Drop Visual Editor is currently under development. Site settings will reflect the selected template and active widgets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Homepage Designation */}
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Site Homepage</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                            Select which page should serve as the site's primary landing page.
                        </p>
                        <select
                            value={homePageId || ""}
                            onChange={(e) => setHomePageId(e.target.value || null)}
                            style={{
                                width: "100%",
                                padding: "0.6rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--bg-primary)",
                                color: "var(--text-primary)",
                                marginBottom: "1rem"
                            }}
                        >
                            <option value="">Default (Hardcoded Layout)</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            You can build any page as a "Magazine" page and set it as home here.
                        </div>
                    </div>

                    {/* Widget Manager */}
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Active Widgets</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                            Toggle widgets to show/hide them on your site.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {widgets.map(widget => (
                                <div key={widget.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "0.95rem" }}>{widget.name}</span>
                                    <button
                                        onClick={() => toggleWidget(widget.id)}
                                        style={{
                                            width: "40px",
                                            height: "20px",
                                            borderRadius: "10px",
                                            backgroundColor: widget.active ? "#10b981" : "var(--bg-tertiary)",
                                            border: "none",
                                            position: "relative",
                                            cursor: "pointer",
                                            transition: "background-color 0.3s"
                                        }}
                                    >
                                        <div style={{
                                            width: "14px",
                                            height: "14px",
                                            borderRadius: "50%",
                                            backgroundColor: "white",
                                            position: "absolute",
                                            top: "3px",
                                            left: widget.active ? "23px" : "3px",
                                            transition: "left 0.3s"
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Help & Documentation</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            Need help building your layout? Check out our
                            <a href="#" style={{ color: "var(--accent)", marginLeft: "4px" }}>Layout Guide</a>
                            to learn about grid systems and widget placements.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
