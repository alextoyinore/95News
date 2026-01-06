"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ width: "40px", height: "40px" }} />;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn"
            style={{
                width: "40px",
                height: "40px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                fontSize: "1.2rem",
                color: "var(--text-primary)"
            }}
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
