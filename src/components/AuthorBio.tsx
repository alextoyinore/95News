import React from "react";

interface Author {
    name: string;
    bio: string;
    avatar: string;
}

interface AuthorBioProps {
    author: Author;
}

export default function AuthorBio({ author }: AuthorBioProps) {
    return (
        <section className="glass" style={{
            marginTop: "5rem",
            padding: "2.5rem",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            gap: "2rem",
            alignItems: "center"
        }}>
            <img
                src={author.avatar}
                alt={author.name}
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--accent)"
                }}
            />
            <div>
                <h4 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", fontWeight: "700" }}>About {author.name}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>{author.bio}</p>
                <div style={{ marginTop: "1rem" }}>
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
                </div>
            </div>
        </section>
    );
}
