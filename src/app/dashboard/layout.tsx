"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
    LayoutDashboard,
    FileText,
    Tags,
    Hash,
    MessageCircle,
    Layers,
    Palette,
    User,
    LogOut,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Menu
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/dashboard/posts", icon: FileText },
    { name: "Categories", href: "/dashboard/categories", icon: Layers },
    { name: "Tags", href: "/dashboard/tags", icon: Hash },
    { name: "Comments", href: "/dashboard/comments", icon: MessageCircle },
    { name: "Pages", href: "/dashboard/pages", icon: FileText },
    { name: "Media", href: "/dashboard/media", icon: ImageIcon },
    { name: "Layout", href: "/dashboard/layout-builder", icon: Palette },
    { name: "Profile", href: "/dashboard/profile", icon: User },
];

import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, userRecord, signOut } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <AuthGuard>
            <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-secondary)", overflow: "hidden" }}>
                {/* Dashboard Sidebar */}
                <aside className="glass" style={{
                    width: isCollapsed ? "80px" : "280px",
                    padding: isCollapsed ? "2rem 0.5rem" : "2rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflowY: "auto",
                    borderRight: "1px solid var(--border)",
                    flexShrink: 0,
                    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease",
                    position: "relative"
                }}>
                    <div style={{
                        marginBottom: "3rem",
                        padding: isCollapsed ? "0" : "0 0.5rem",
                        textAlign: isCollapsed ? "center" : "left",
                        transition: "all 0.3s ease"
                    }}>
                        <Link href="/" style={{
                            fontSize: isCollapsed ? "1.2rem" : "1.5rem",
                            fontWeight: "800",
                            fontFamily: "var(--font-heading)",
                            letterSpacing: "-1px",
                            display: "block"
                        }}>
                            {isCollapsed ? "95" : "95News"}
                            {!isCollapsed && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>ADMIN</span>}
                        </Link>
                    </div>

                    <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: isCollapsed ? "center" : "flex-start",
                                        gap: isCollapsed ? "0" : "1rem",
                                        padding: "0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        color: isActive ? "var(--accent)" : "var(--text-primary)",
                                        backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                                        fontWeight: isActive ? "600" : "400",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }} title={isCollapsed ? item.name : ""}>
                                        <item.icon size={20} style={{ flexShrink: 0 }} />
                                        {!isCollapsed && (
                                            <span style={{
                                                whiteSpace: "nowrap",
                                                opacity: 1,
                                                transition: "opacity 0.2s ease"
                                            }}>
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Collapse Toggle at Bottom of Nav */}
                        <div
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{
                                marginTop: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isCollapsed ? "center" : "flex-start",
                                gap: isCollapsed ? "0" : "1rem",
                                padding: "0.8rem",
                                borderRadius: "var(--radius-sm)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                backgroundColor: "var(--bg-tertiary)",
                                border: "1px solid var(--border)"
                            }}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                            {!isCollapsed && <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>Collapse</span>}
                        </div>
                    </nav>

                    {/* Sidebar footer can be used for extra info or removed */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "auto" }}>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            padding: "0 0.5rem",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden"
                        }}>
                            {isCollapsed ? "©'26" : "© 2026 95News Admin"}
                        </div>
                    </div>
                </aside>

                {/* Dashboard Content Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <DashboardNavbar />
                    <main style={{
                        flex: 1,
                        padding: isCollapsed ? "2rem 1.5rem" : "2rem 3rem",
                        overflowY: "auto",
                        transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}>
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
