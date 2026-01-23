import React from "react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Facebook, Youtube, Globe } from "lucide-react";
import { SocialHandles } from "@/types/firestore";

interface Author {
    id?: string;
    name: string;
    bio: string;
    avatar: string;
    socialHandles?: SocialHandles;
}

interface AuthorBioProps {
    author: Author;
}

export default function AuthorBio({ author }: AuthorBioProps) {
    return (
        <section className="glass author-bio-container" style={{
            marginTop: "5rem",
            padding: "2.5rem",
            borderRadius: "var(--radius-lg)"
        }}>
            <div style={{ flexShrink: 0 }}>
                <img
                    src={author.avatar}
                    alt={author.name}
                    style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--accent)",
                        display: "block"
                    }}
                />
            </div>
            <div>
                <h4 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", fontWeight: "700" }}>About {author.name}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>{author.bio}</p>

                {author.socialHandles && Object.values(author.socialHandles).some(v => v) && (
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        {author.socialHandles.twitter && (
                            <a href={author.socialHandles.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Twitter size={18} />
                            </a>
                        )}
                        {author.socialHandles.instagram && (
                            <a href={author.socialHandles.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Instagram size={18} />
                            </a>
                        )}
                        {author.socialHandles.linkedin && (
                            <a href={author.socialHandles.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Linkedin size={18} />
                            </a>
                        )}
                        {author.socialHandles.facebook && (
                            <a href={author.socialHandles.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Facebook size={18} />
                            </a>
                        )}
                        {author.socialHandles.youtube && (
                            <a href={author.socialHandles.youtube} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Youtube size={18} />
                            </a>
                        )}
                        {author.socialHandles.website && (
                            <a href={author.socialHandles.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                                <Globe size={18} />
                            </a>
                        )}
                    </div>
                )}

                <div style={{ marginTop: "1.5rem" }}>
                    {author.id ? (
                        <Link href={`/author/${author.id.trim()}`} style={{
                            color: "var(--accent)",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            textDecoration: "none"
                        }}>View all articles by {author.name.split(' ')[0]} →</Link>
                    ) : (
                        <button style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent)",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: 0
                        }}>
                            View all articles by {author.name.split(' ')[0]} →
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
