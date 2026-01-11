"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ width: "40px", height: "40px" }} />;

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <button
            onClick={cycleTheme}
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
            title={`Current theme: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
            aria-label="Toggle Theme"
        >
            {theme === "light" ? (
                <Sun size={20} />
            ) : theme === "dark" ? (
                <Moon size={20} />
            ) : (
                <Laptop size={20} />
            )}
        </button>
    );
}
