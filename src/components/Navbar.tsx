"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Search, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, userRecord } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isStaff = userRecord && ['superuser', 'writer'].includes(userRecord.role);

    return (
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
                <div style={{
                    display: "flex",
                    gap: "1.5rem",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                }}>
                    <Link href="/world">World</Link>
                    <Link href="/politics">Politics</Link>
                    <Link href="/tech">Tech</Link>
                    <Link href="/lifestyle">Lifestyle</Link>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
        </nav>
    );
}
