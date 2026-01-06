"use client";

import React, { useEffect, useState } from "react";

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            if (scrollHeight > 0) {
                setProgress((currentScroll / scrollHeight) * 100);
            }
        };

        window.addEventListener("scroll", updateProgress);
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(var(--accent-rgb), 0.1)",
            zIndex: 9999
        }}>
            <div style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "var(--accent)",
                transition: "width 0.1s ease-out"
            }} />
        </div>
    );
}
