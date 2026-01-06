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
        <div style={{
            position: "relative",
            marginBottom: "4rem",
            height: "420px",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
        }}>
            {/* Background Image with Zoom Effect */}
            <div style={{
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
                zIndex: 0
            }} />

            {/* Overlay Gradient */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
                zIndex: 1
            }} />

            {/* Content Container */}
            <div className="container" style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "4rem 2rem",
                color: "white"
            }}>
                <div style={{ maxWidth: "800px" }}>
                    <span style={{
                        backgroundColor: "var(--accent)",
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                        display: "inline-block"
                    }}>
                        {currentPost.category}
                    </span>

                    <Link href={`/posts/${currentPost.id}`}>
                        <h1 style={{
                            fontSize: "2.8rem",
                            fontWeight: "800",
                            lineHeight: "1.1",
                            marginBottom: "1.5rem",
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                        }}>
                            {currentPost.title}
                        </h1>
                    </Link>

                    <p style={{
                        fontSize: "1.2rem",
                        opacity: 0.9,
                        marginBottom: "2rem",
                        lineHeight: "1.6",
                        maxWidth: "600px"
                    }}>
                        {currentPost.excerpt}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                            {currentPost.author[0]}
                        </div>
                        <div>
                            <div style={{ fontWeight: "600" }}>{currentPost.author}</div>
                            <div style={{ opacity: 0.7 }}>{currentPost.date}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Dots */}
            <div style={{
                position: "absolute",
                bottom: "2rem",
                right: "2rem",
                zIndex: 3,
                display: "flex",
                gap: "0.8rem"
            }}>
                {posts.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: idx === currentIndex ? "30px" : "10px",
                            height: "10px",
                            borderRadius: "5px",
                            backgroundColor: idx === currentIndex ? "var(--accent)" : "rgba(255,255,255,0.3)",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
