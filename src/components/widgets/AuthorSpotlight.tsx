"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { User } from "@/types/firestore";

export default function AuthorSpotlight() {
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                // Try to find an editor or superuser
                const q = query(
                    collection(db, "users"),
                    where("role", "in", ["editor", "superuser"]),
                    limit(1)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setAuthor({ id: snap.docs[0].id, ...snap.docs[0].data() } as User);
                } else {
                    // Fallback to any user if no editors found
                    const fallbackSnap = await getDocs(query(collection(db, "users"), limit(1)));
                    if (!fallbackSnap.empty) {
                        setAuthor({ id: fallbackSnap.docs[0].id, ...fallbackSnap.docs[0].data() } as User);
                    }
                }
            } catch (error) {
                console.error("Error fetching spotlight author:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuthor();
    }, []);

    if (loading) return <div className="glass" style={{ height: "200px", borderRadius: "var(--radius-md)", animation: "pulse 1.5s infinite" }} />;
    if (!author) return null;

    const displayName = author.displayName || author.email.split('@')[0];

    return (
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "3rem", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.3rem", display: "inline-block" }}>
                Author Spotlight
            </h3>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "800",
                    color: "white",
                    overflow: "hidden",
                    border: "4px solid var(--bg-primary)",
                    boxShadow: "var(--shadow-md)"
                }}>
                    {author.photoURL ? (
                        <img src={author.photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        displayName[0].toUpperCase()
                    )}
                </div>

                <div>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: "700" }}>{displayName}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {author.role === 'superuser' ? 'editor' : author.role}
                    </span>
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {author.bio || `Passionate journalist at 95News. Follow for more deep-dives and investigations.`}
                </p>

                <Link href={`/author/${author.id.trim()}`} className="btn btn-outline" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", width: "100%" }}>See All Stories</Link>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
