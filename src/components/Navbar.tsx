"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Search, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/firestore";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { user, userRecord } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        fetchCategories();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchCategories = async () => {
        try {
            const q = query(collection(db, "categories"), orderBy("name"));
            const snap = await getDocs(q);
            setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const isStaff = userRecord && ['superuser', 'writer'].includes(userRecord.role);

    // Specific Priority Order (Matches user request)
    const prioritySlugs = ["world", "political", "business", "technology", "lifestyle"];

    const topLevel = categories.filter(c => !c.parentId);

    const mainLinks = prioritySlugs
        .map(slug => topLevel.find(c => c.slug === slug))
        .filter(Boolean) as Category[];

    return (
        <>
            <nav className={`glass ${scrolled ? "scrolled" : ""}`} style={{
                position: "fixed",
                top: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 2rem)",
                maxWidth: "1200px",
                zIndex: 1000,
                padding: "0.8rem 1.5rem",
                transition: "all 0.3s ease",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <Link href="/" style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        fontFamily: "var(--font-heading)",
                        letterSpacing: "-1px"
                    }}>
                        95<span style={{ color: "var(--accent)" }}>News</span>
                    </Link>

                    <div className="nav-links" style={{
                        gap: "1.5rem",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                    }}>
                        {mainLinks.map(cat => (
                            <Link key={cat.id} href={`/category/${cat.slug}`} className="hover-accent">
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="nav-links">
                        <Link href="/search" style={{ fontSize: "1.2rem", padding: "0.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }} title="Search">
                            <Search size={20} />
                        </Link>

                        <ThemeToggle />

                        {!user ? (
                            <>
                                <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                                    <LogIn size={18} /> Log In
                                </Link>
                                <Link href="/register" className="btn btn-primary" style={{ borderRadius: "var(--radius-md)", fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}>
                                    Join Us
                                </Link>
                            </>
                        ) : (
                            <>
                                {isStaff && (
                                    <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--accent)" }}>
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                )}
                                <button className="btn btn-primary" style={{ borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>Subscribe</button>
                            </>
                        )}
                    </div>

                    {/* Mobile Search Icon */}
                    <Link
                        href="/search"
                        style={{
                            display: "none",
                            color: "var(--text-primary)",
                            padding: "0.5rem"
                        }}
                        className="mobile-only-flex"
                    >
                        <Search size={24} />
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{
                            display: "none",
                            background: "none",
                            border: "none",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            padding: "0.5rem"
                        }}
                        id="mobile-menu-toggle"
                        className="mobile-only-flex"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "var(--bg-primary)",
                    zIndex: 999,
                    padding: "6rem 2rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    overflowY: "auto"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)" }}>Categories</h3>
                        {mainLinks.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ fontSize: "1.5rem", fontWeight: "700" }}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link
                            href="/search"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ fontSize: "1.5rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Search size={24} /> Search
                        </Link>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "600" }}>Appearance</span>
                            <ThemeToggle />
                        </div>

                        {!user ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>Log In</Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ width: "100%" }}>Join Us</Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {isStaff && (
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent)" }}>Dashboard</Link>
                                )}
                                <button className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>Subscribe</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 1024px) {
                    .mobile-only-flex {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    );
}
