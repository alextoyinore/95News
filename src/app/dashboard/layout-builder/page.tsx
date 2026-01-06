"use client";

import React, { useState } from 'react';

const initialTemplates = [
    { id: 'magazine', name: "Magazine Grid", icon: "📰", active: true, description: "Classic news layout with a large hero slider and categorized sections." },
    { id: 'classic', name: "Classic List", icon: "📝", active: false, description: "Minimalist list-based layout focused on readability and chronological order." },
    { id: 'modern', name: "Modern Cards", icon: "🃏", active: false, description: "Visual-heavy card layout perfect for lifestyle and photography blogs." },
];

const initialWidgets = [
    { id: 'w1', name: 'Social Sidebar', active: true },
    { id: 'w2', name: 'Newsletter Signup', active: true },
    { id: 'w3', name: 'Most Read Posts', active: true },
    { id: 'w4', name: 'Trending Tags', active: false },
    { id: 'w5', name: 'Author Spotlight', active: false },
];

export default function LayoutBuilderPage() {
    const [templates, setTemplates] = useState(initialTemplates);
    const [widgets, setWidgets] = useState(initialWidgets);
    const [isSaving, setIsSaving] = useState(false);

    const handleSelectTemplate = (id: string) => {
        setTemplates(templates.map(t => ({ ...t, active: t.id === id })));
    };

    const toggleWidget = (id: string) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, active: !w.active } : w));
    };

    const handleSaveLayout = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Layout settings updated successfully!");
        }, 1000);
    };

    const activeTemplate = templates.find(t => t.active);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem" }}>Layout Builder</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Customize how your homepage and categories look to your readers.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSaveLayout}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Layout Settings"}
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Template Selection */}
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>Choose a Base Template</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template.id)}
                                    style={{
                                        padding: "1.5rem",
                                        borderRadius: "var(--radius-md)",
                                        border: template.active ? "2px solid var(--accent)" : "1px solid var(--border)",
                                        backgroundColor: template.active ? "var(--bg-tertiary)" : "transparent",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{template.icon}</div>
                                    <div style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>{template.name}</div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{template.description}</p>
                                    {template.active && (
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
                                <p>Drag and Drop Visual Editor Coming Soon</p>
                                <p style={{ fontSize: "0.8rem" }}>Currently configuring: <strong>{activeTemplate?.name}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
