"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeroSliderProps {
    posts: any[];
}

export default function HeroSlider({ posts }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % posts.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [posts.length]);

    if (!posts || posts.length === 0) return null;

    const currentPost = posts[currentIndex];

    return (
        <div className="hero-slider" style={{
            position: "relative",
            marginBottom: "4rem",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
        }}>
            {/* Background Image with Zoom Effect */}
            <div key={currentPost.id} style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `url(${currentPost.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "transform 5s ease, opacity 0.8s ease",
                transform: "scale(1.05)",
                zIndex: 0,
                animation: "zoomIn 5s ease forwards"
            }} />

            {/* Overlay Gradient */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)",
                zIndex: 1
            }} />

            {/* Content Container */}
            <div className="container hero-content" style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                color: "white"
            }}>
                <div style={{ maxWidth: "800px" }}>
                    <span style={{
                        backgroundColor: "var(--accent)",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "1rem",
                        display: "inline-block"
                    }}>
                        {currentPost.category}
                    </span>

                    <Link href={`/${currentPost.slug || currentPost.id}`}>
                        <h1 className="hero-title" style={{
                            fontSize: "clamp(1.8rem, 5vw, 3rem)",
                            fontWeight: "800",
                            lineHeight: "1.1",
                            marginBottom: "1rem",
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                        }}>
                            {currentPost.title}
                        </h1>
                    </Link>

                    <p className="hero-excerpt" style={{
                        fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                        opacity: 0.9,
                        marginBottom: "2rem",
                        lineHeight: "1.6",
                        maxWidth: "600px",
                    }}>
                        {currentPost.excerpt}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                            {currentPost.author ? currentPost.author[0] : 'A'}
                        </div>
                        <div>
                            <div style={{ fontWeight: "600" }}>{currentPost.author}</div>
                            <Link href={currentPost.archiveLink || "#"} style={{ opacity: 0.7 }} className="hover-underline">
                                {currentPost.date}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Dots */}
            <div style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "1.5rem",
                zIndex: 3,
                display: "flex",
                gap: "0.6rem"
            }}>
                {posts.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: idx === currentIndex ? "24px" : "8px",
                            height: "8px",
                            borderRadius: "4px",
                            backgroundColor: idx === currentIndex ? "var(--accent)" : "rgba(255,255,255,0.3)",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                .hero-slider {
                    height: 500px;
                }
                .hero-content {
                    padding: 4rem 3rem;
                }
                .hero-title {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    transition: color 0.2s ease;
                }
                .hero-title:hover {
                    color: var(--accent);
                }
                .hover-underline:hover {
                    text-decoration: underline;
                }
                .hero-excerpt {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                @keyframes zoomIn {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }
                @media (max-width: 768px) {
                    .hero-slider {
                        height: 400px;
                        border-radius: var(--radius-md);
                    }
                    .hero-content {
                        padding: 3rem 1.5rem;
                    }
                    .hero-excerpt {
                        -webkit-line-clamp: 2;
                    }
                }
                @media (max-width: 480px) {
                    .hero-slider {
                        height: 350px;
                    }
                    .hero-excerpt {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
