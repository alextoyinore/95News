"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getLayoutSettings } from "@/lib/layoutActions";
import { User } from "@/types/firestore";
import { Twitter, Instagram, Linkedin, Facebook, Youtube, Globe } from "lucide-react";

export default function AuthorSpotlight() {
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                // 1. Fetch Layout Settings to see if an author is manually selected
                const settings = await getLayoutSettings();
                const manualAuthorId = settings?.spotlightAuthorId;

                if (manualAuthorId) {
                    const userDoc = await getDoc(doc(db, "users", manualAuthorId));
                    if (userDoc.exists()) {
                        setAuthor({ id: userDoc.id, ...userDoc.data() } as User);
                        setLoading(false);
                        return;
                    }
                }

                // 2. Fallback to rotation logic
                // Fetch potential authors
                const q = query(
                    collection(db, "users"),
                    where("role", "in", ["editor", "superuser", "writer", "contributor"])
                );
                const snap = await getDocs(q);

                let eligibleAuthors = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as User))
                    .filter(u => u.bio && u.photoURL); // Must have bio AND image

                if (eligibleAuthors.length > 0) {
                    // Selection based on current day of the year for a "daily rotation"
                    const now = new Date();
                    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                    const selectedIndex = dayOfYear % eligibleAuthors.length;
                    setAuthor(eligibleAuthors[selectedIndex]);
                } else {
                    // Fallback to any user with bio and image if no editors qualify
                    const fallbackSnap = await getDocs(collection(db, "users"));
                    const anyEligible = fallbackSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as User))
                        .filter(u => u.bio && u.photoURL);

                    if (anyEligible.length > 0) {
                        setAuthor(anyEligible[0]);
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

                {author.socialHandles && Object.values(author.socialHandles).some(v => v) && (
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", margin: "0.5rem 0" }}>
                        {author.socialHandles.twitter && (
                            <a href={author.socialHandles.twitter} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Twitter size={18} />
                            </a>
                        )}
                        {author.socialHandles.instagram && (
                            <a href={author.socialHandles.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Instagram size={18} />
                            </a>
                        )}
                        {author.socialHandles.linkedin && (
                            <a href={author.socialHandles.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Linkedin size={18} />
                            </a>
                        )}
                        {author.socialHandles.facebook && (
                            <a href={author.socialHandles.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Facebook size={18} />
                            </a>
                        )}
                        {author.socialHandles.youtube && (
                            <a href={author.socialHandles.youtube} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Youtube size={18} />
                            </a>
                        )}
                        {author.socialHandles.website && (
                            <a href={author.socialHandles.website} target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <Globe size={18} />
                            </a>
                        )}
                    </div>
                )}

                <Link href={`/author/${author.id.trim()}`} className="btn btn-outline" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", width: "100%" }}>See All Stories</Link>
            </div>

            <style jsx>{`
                .social-icon-link {
                    color: var(--text-secondary);
                    transition: color 0.2s ease;
                }
                .social-icon-link:hover {
                    color: var(--accent);
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
