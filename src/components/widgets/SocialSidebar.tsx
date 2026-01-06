"use client";

export default function SocialSidebar() {
    const socialLinks = [
        { platform: "Facebook", count: "125k", color: "#1877F2", icon: "FB" },
        { platform: "Twitter", count: "89k", color: "#1DA1F2", icon: "TW" },
        { platform: "Instagram", count: "210k", color: "#E4405F", icon: "IG" },
        { platform: "YouTube", count: "450k", color: "#FF0000", icon: "YT" }
    ];

    return (
        <aside style={{ marginBottom: "3rem" }}>
            <h3 style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                borderBottom: "2px solid var(--accent)",
                display: "inline-block",
                paddingBottom: "0.3rem"
            }}>
                Follow Us
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {socialLinks.map((link) => (
                    <a
                        key={link.platform}
                        href={`https://${link.platform.toLowerCase()}.com/95news.ng`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: "1rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--bg-tertiary)",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                            transition: "transform 0.2s",
                            border: "1px solid var(--border)"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        <span style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "0.2rem" }}>{link.icon}</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>{link.count}</span>
                        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Followers</span>
                    </a>
                ))}
            </div>
        </aside>
    );
}
