"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardNavbar() {
    const [totalPostsToday, setTotalPostsToday] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, userRecord, signOut } = useAuth();

    useEffect(() => {
        const fetchTodayCount = async () => {
            try {
                // Get start of today
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const q = query(
                    collection(db, "posts"),
                    where("createdAt", ">=", startOfToday)
                );
                const snap = await getDocs(q);
                setTotalPostsToday(snap.size);
            } catch (error) {
                console.error("Error fetching today's count:", error);
            }
        };
        fetchTodayCount();
    }, []);

    const initials = (userRecord?.displayName || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <header className="glass" style={{
            height: "70px",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backgroundColor: "var(--glass-bg)"
        }}>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "1.2"
                }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Today's Activity</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>{totalPostsToday} New Posts</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <ThemeToggle />
                <Link href="/dashboard/pages/new" className="btn" style={{ fontSize: "0.9rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    Add Page
                </Link>
                <Link href="/dashboard/posts/new" className="btn btn-primary" style={{ fontSize: "0.9rem", borderRadius: "var(--radius-md)" }}>
                    + New Post
                </Link>

                <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        backgroundColor: isProfileOpen ? "var(--bg-tertiary)" : "transparent",
                    }}
                    onMouseEnter={(e) => !isProfileOpen && (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
                    onMouseLeave={(e) => !isProfileOpen && (e.currentTarget.style.backgroundColor = "transparent")}
                >
                    <div style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        border: "2px solid var(--border)"
                    }}>
                        {userRecord?.photoURL ? (
                            <img src={userRecord.photoURL} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            initials
                        )}
                    </div>
                    <ChevronDown size={14} style={{
                        color: "var(--text-muted)",
                        transform: isProfileOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease"
                    }} />

                    {/* Profile Flyout */}
                    {isProfileOpen && (
                        <>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsProfileOpen(false);
                                }}
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 10
                                }}
                            />
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="glass"
                                style={{
                                    position: "absolute",
                                    top: "120%",
                                    right: 0,
                                    width: "220px",
                                    padding: "0.8rem",
                                    borderRadius: "var(--radius-md)",
                                    boxShadow: "var(--shadow-lg)",
                                    border: "1px solid var(--border)",
                                    zIndex: 11,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.2rem",
                                    animation: "fadeDown 0.2s ease-out"
                                }}
                            >
                                <div style={{ padding: "0.5rem 0.8rem", marginBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                                        {userRecord?.displayName || user?.email?.split('@')[0]}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase", fontWeight: "600" }}>
                                        {userRecord?.role}
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.8rem",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        textDecoration: "none",
                                        color: "var(--text-primary)",
                                        fontSize: "0.85rem",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <User size={16} /> My Profile
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.8rem",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "none",
                                        background: "none",
                                        width: "100%",
                                        textAlign: "left",
                                        color: "#ef4444",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
